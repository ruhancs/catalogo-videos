import { Genre, GenreId } from '../../../domain/genre.aggregate';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '../../../../shared/infra/db/in-memory/in-memory.repository';
import {
  GenreFilter,
  IGenreRepository,
} from '../../../domain/genre-repository';

export class GenreInMemoryRepository
  extends InMemorySearchableRepository<Genre, GenreId, GenreFilter>
  implements IGenreRepository
{
  findByIds(ids: GenreId[]): Promise<Genre[]> {
    throw new Error('Method not implemented.');
  }
  existsById(
    ids: GenreId[],
  ): Promise<{ exists: GenreId[]; not_exists: GenreId[] }> {
    throw new Error('Method not implemented.');
  }
  sortableFields: string[] = ['name', 'created_at'];

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }

  protected async applyFilter(
    items: Genre[],
    filter: GenreFilter,
  ): Promise<Genre[]> {
    if (!filter) {
      return items;
    }

    return items.filter((genre) => {
      //verificar se o name esta inserido no filter, e se no filter.name existe nos items
      const containsName =
        filter.name &&
        genre.name.toLowerCase().includes(filter.name.toLowerCase());

      //verificar se o categories_id esta inserido no filter
      // e se no filter.categories_id existe no map de genre.categories_id.has
      //some verifica no map de filter.categories_id existe no genre.categories_id
      //se no genre existe algum dos categories_id que foi passado no filter
      //se algum existir armazena em containsCategoriesId
      const containsCategoriesId =
        filter.categories_id &&
        filter.categories_id.some((c) => genre.categories_id.has(c.id));
      //se tiver filtro para name e category_id
      return filter.name && filter.categories_id
        ? containsName && containsCategoriesId //retorna os valores que atendem os dois filtros
        : filter.name // verifica se existe filter.name, caso nao possua filtros de name e category_id
          ? containsName // retorna os nomes que atendem o filtro caso o filtro for por name
          : containsCategoriesId; // retorna as categories_id que atendem o filtro caso o filtro for por categories_id
    });
  }

  protected applySort(
    items: Genre[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ): Genre[] {
    return !sort
      ? super.applySort(items, 'created_at', 'desc') //se nao existir sort retorna por data decrescente
      : super.applySort(items, sort, sort_dir);
  }
}
