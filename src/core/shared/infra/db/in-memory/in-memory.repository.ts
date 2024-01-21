import { Entity } from '../../../domain/entity';
import { NotFoundError } from '../../../domain/errors/not_found';
import {
  IRepository,
  ISearchableRepository,
} from '../../../domain/repository/repository_interface';
import {
  SearchParams,
  SortDirection,
} from '../../../domain/repository/search-params';
import { SearchResult } from '../../../domain/repository/search-result';
import { ValueObject } from '../../../domain/value_object';

export abstract class InMemoryRepository<
  E extends Entity,
  EntityID extends ValueObject,
> implements IRepository<E, EntityID>
{
  findByIds(ids: EntityID[]): Promise<E[]> {
    throw new Error('Method not implemented.');
  }
  existsById(ids: EntityID[]): Promise<{ exists: EntityID[]; not_exists: EntityID[]; }> {
    throw new Error('Method not implemented.');
  }
  items: E[] = [];
  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }
  async bulkInsert(entities: any[]): Promise<void> {
    this.items.push(...entities);
  }
  async update(entity: E): Promise<void> {
    const indexFounded = this.items.findIndex((item) =>
      item.entity_id.equals(entity.entity_id),
    );
    if (indexFounded === -1) {
      throw new NotFoundError(entity.entity_id, this.getEntity());
    }
    this.items[indexFounded] = entity;
  }
  async delete(entity_id: EntityID): Promise<void> {
    const indexFounded = this.items.findIndex((item) =>
      item.entity_id.equals(entity_id),
    );
    if (indexFounded === -1) {
      throw new NotFoundError(entity_id, this.getEntity());
    }

    this.items.splice(indexFounded, 1);
  }
  async findById(entity_id: EntityID): Promise<E | null> {
    const item = this.items.find((item) => item.entity_id.equals(entity_id));
    return typeof item === 'undefined' ? null : item;
  }
  async findAll(): Promise<any[]> {
    return this.items;
  }
  abstract getEntity(): new (...args: any[]) => E;
}

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityID extends ValueObject,
    Filter = string, //se nao passar um valor permanece como string
  >
  extends InMemoryRepository<E, EntityID>
  implements ISearchableRepository<E, EntityID, Filter>
{
  sortableFields: string[] = [];
  async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = this.applySort(
      itemsFiltered,
      props.sort,
      props.sort_dir,
    );
    const itemsPaginated = this.applyPaginate(
      itemsSorted,
      props.page,
      props.per_page,
    );

    return new SearchResult({
      items: itemsPaginated,
      total: itemsFiltered.length,
      current_page: props.page,
      per_page: props.per_page,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null,
  ): Promise<E[]>;

  protected applyPaginate(
    items: E[],
    page: SearchParams['page'],
    per_page: SearchParams['per_page'],
  ) {
    const start = (page - 1) * per_page;
    const limit = start + per_page;
    return items.slice(start, limit);
  }

  protected applySort(
    items: E[],
    sort: string | null,
    sort_dir: SortDirection | null,
    custom_getter?: (sort: string, item: E) => any,
  ) {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aValue = custom_getter ? custom_getter(sort, a) : a[sort];
      const bValue = custom_getter ? custom_getter(sort, b) : b[sort];
      if (aValue < bValue) {
        return sort_dir === 'asc' ? -1 : 1;
      }

      if (aValue > bValue) {
        return sort_dir === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }
}
