import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { InMemorySearchableRepository } from '../../../../shared/infra/db/in-memory/in-memory.repository';
import { Category, CategoryId } from '../../../domain/category.aggregat';
import {
  CategoryFilter,
  ICategoryRepository,
} from '../../../domain/category_repository';

export class CategoryInMemoryRepository
  extends InMemorySearchableRepository<Category, Uuid>
  implements ICategoryRepository
{
  findByIds(ids: CategoryId[]): Promise<Category[]> {
    throw new Error('Method not implemented.');
  }
  existsById(ids: CategoryId[]): Promise<{ exists: CategoryId[]; not_exists: CategoryId[]; }> {
    throw new Error('Method not implemented.');
  }
  sortableFields: string[] = ['name', 'created_at'];
  protected async applyFilter(
    items: Category[],
    filter: CategoryFilter | null,
  ): Promise<Category[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      return i.name.toLowerCase().includes(filter.toLowerCase());
    });
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
  protected applySort(
    items: Category[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ): Category[] {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, 'created_at', 'desc'); //se nao for aplicado sort ordena por ordem decrescente de criacao
  }
}
