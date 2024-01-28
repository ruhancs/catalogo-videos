import { CategoryId } from '@core/category/domain/category.aggregat';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '@core/shared/domain/value_object';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { GenreValidatorFactory } from './genre_validator';
import { GenreFakeBuilder } from './genre-fake-builder';

export class GenreId extends Uuid {}

export type GenreConstructorProps = {
  genre_id?: GenreId;
  name: string;
  categories_id: Map<string, CategoryId>; //Map para evitar duplicacoes de ids
  is_active?: boolean;
  created_at?: Date;
};

export type GenreCreateCommand = {
  name: string;
  categories_id: CategoryId[]; //Map para evitar duplicacoes de ids
  is_active?: boolean;
};

//genre possui relacao com categoria, os agregados definem invariancia
//a relacao entre os agregados devem ser fraca, para que as mudancas nos agregados nao impactem um ao outro
export class Genre extends AggregateRoot {
  genre_id: GenreId;
  name: string;
  categories_id: Map<string, CategoryId>; //Map para evitar duplicacoes de ids
  is_active: boolean;
  created_at: Date;

  constructor(props: GenreConstructorProps) {
    super();
    this.genre_id = props.genre_id ?? new GenreId();
    this.name = props.name;
    this.categories_id = props.categories_id;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: GenreCreateCommand) {
    const genre = new Genre({
      ...props,
      //criar um map com a chave sendo id de categoria e o valor sendo objeto CategoryId
      categories_id: new Map(props.categories_id.map((id) => [id.id, id])),
    });
    //validar
    genre.validate();
    return genre;
  }

  changeName(name: string) {
    this.name = name;
    this.validate(['name']);
  }

  activate() {
    this.is_active = true;
  }

  deactivate() {
    this.is_active = false;
  }

  //categoryId ja sera validado pelo objeto de valor
  addCategoryId(categoryId: CategoryId) {
    this.categories_id.set(categoryId.id, categoryId);
  }

  //categoryId ja sera validado pelo objeto de valor
  removeCategoryId(categoryId: CategoryId) {
    this.categories_id.delete(categoryId.id);
  }

  //categoryId ja sera validado pelo objeto de valor
  syncCategoriesId(categoriesId: CategoryId[]) {
    if (!categoriesId.length) {
      return;
    }
    this.categories_id = new Map(
      categoriesId.map((categoryId) => [categoryId.id, categoryId]),
    );
  }

  validate(fields?: string[]) {
    const validator = GenreValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return GenreFakeBuilder;
  }

  get entity_id(): ValueObject {
    return this.genre_id;
  }

  toJSON() {
    return {
      genre_id: this.genre_id.id,
      name: this.name,
      //criar um array somemte com os ids do map de categoriesId
      categories_id: Array.from(this.categories_id.values()).map(
        (category_id) => category_id.id,
      ),
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
