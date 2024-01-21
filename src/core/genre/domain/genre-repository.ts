import { Uuid } from '@core/shared/domain/value_objects/uuid.vo';
import { CategoryId } from '../../category/domain/category.aggregat';
import { ISearchableRepository } from '../../shared/domain/repository/repository_interface';
import {
  SearchParams,
  SearchParamsConstructorProps,
} from '../../shared/domain/repository/search-params';
import { SearchResult } from '../../shared/domain/repository/search-result';
import { Genre, GenreId } from './genre.aggregate';

export type GenreFilter = {
  name?: string;
  categories_id?: CategoryId[];
};

export class GenreSearchParams extends SearchParams<GenreFilter> {
  private constructor(props: SearchParamsConstructorProps<GenreFilter> = {}) {
    super(props);
  }

  //criar o SearchParams de genre aceita buscar ou por nome ou objeto de valor de categoryId ou string com id da categoria
  static create(
    props: Omit<SearchParamsConstructorProps<GenreFilter>, 'filter'> & {
      filter?: {
        name?: string;
        categories_id?: CategoryId[] | string[];
      };
    } = {},
  ) {
    //props.filter?.categories_id? utilizado pois nao se tem certeza que o filtro possui categories_id
    //verificar se o filter é uma string ou objeto de categoryId
    // se o filtro nao for objeto de categoryId transforma a string no objeto de categoryId
    const categories_id = props.filter?.categories_id?.map((c) => {
      console.log('ategory id _______________');
      console.log(c);
      console.log(c instanceof CategoryId);
      //validacao dos CategoryId[] é feita no controller
      return c instanceof Uuid ? c : new CategoryId(c);
    });

    return new GenreSearchParams({
      ...props,
      filter: {
        //props.filter? pode nao existir
        name: props.filter?.name,
        categories_id, //undefined ou array de categoryId
      },
    });
  }

  get filter(): GenreFilter | null {
    return this._filter;
  }

  protected set filter(value: GenreFilter | null) {
    // se o value nao existir ou se for uma string vazia, retorna null
    //verificacao se possui filtro por name ou categoriesId
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      //normaliza o value.name se existir, converte value para string
      ...(_value?.name && { name: `${_value.name}` }),

      //normaliza o value.categories_id se existire se tiver algum valor em value.categories_id no array
      //inseri o propio valor que esta no array de _value.categories_id em categories_id
      ...(_value?.categories_id &&
        _value?.categories_id.length && {
          categories_id: _value.categories_id,
        }),
    };

    //Object.keys(filter).length === 0, verifica se existe algo em filter
    //inserir no this._filter os valores que contem em filter
    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class GenreSearchResult extends SearchResult<Genre> {}

export interface IGenreRepository
  extends ISearchableRepository<
    Genre,
    GenreId,
    GenreFilter,
    GenreSearchParams,
    GenreSearchResult
  > {}
