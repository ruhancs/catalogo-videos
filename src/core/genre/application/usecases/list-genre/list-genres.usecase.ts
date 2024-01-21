import { GenreOutput, GenreOutputMapper } from '../../common/genre-output';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '../../../../shared/application/pagination-output';
import {
  IGenreRepository,
  GenreSearchParams,
  GenreSearchResult,
} from '../../../domain/genre-repository';
import { ICategoryRepository } from '../../../../category/domain/category_repository';
import { ListGenresInput } from './list-genres.input';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { CategoryId } from '../../../../category/domain/category.aggregat';

export class ListGenresUseCase
  implements IUseCase<ListGenresInput, ListGenresOutput>
{
  constructor(
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const params = GenreSearchParams.create(input);
    const searchResult = await this.genreRepo.search(params);
    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: GenreSearchResult,
  ): Promise<ListGenresOutput> {
    //descompactar os item(genres) do resultado da busca
    const { items: _items } = searchResult;

    //conacatena todos obj de CategoryId em um array, obj de CategoryId estao em um Map<string, CategoryId(obj)>
    const categoriesIdRelated = searchResult.items.reduce<CategoryId[]>(
      (acc, item) => {
        return acc.concat([...item.categories_id.values()]);
      },
      [],
    );
    //TODO - retirar duplicados
    //buscar todas categorias pelos ids encontrados no genre(item)
    const categoriesRelated =
      await this.categoryRepo.findByIds(categoriesIdRelated);

    //montar output de genre
    const items = _items.map((i) => {
      //filtrar somente as categorias que existem no genre(item)
      const categoriesOfGenre = categoriesRelated.filter((c) =>
        i.categories_id.has(c.category_id.id),
      );
      return GenreOutputMapper.toOutput(i, categoriesOfGenre);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListGenresOutput = PaginationOutput<GenreOutput>;
