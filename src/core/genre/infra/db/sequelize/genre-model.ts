import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CategoryModel } from '../../../../category/infra/db/sequelize/category.model';

export type GenreModelProps = {
  genre_id: string;
  name: string;
  categories_id?: GenreCategoryModel[];
  categories?: CategoryModel[];
  is_active: boolean;
  created_at: Date;
};

//relacionamento de genre com categories é muitos para muitos
@Table({ tableName: 'genres', timestamps: false })
export class GenreModel extends Model<GenreModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare genre_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  //busca pela chave estrangeira genre_id, as category_id que possuem a chave na tabela category_genre
  //buscas em category_genre sao mais leves do que buscas na tabela categories
  @HasMany(() => GenreCategoryModel, 'genre_id')
  declare categories_id: GenreCategoryModel[];

  //relacionamento com model de categorias, CategoryModel pertence a muitos GenreCategoryModel
  //CategoryModel referencia do model que GenreCategoryModel esta se relacionando
  //GenreCategoryModel é a tabela pivo criada a tabela category_genre, que contem as relacoes de genre_id e category_id
  //GenreCategoryModel é a ponte entre genero e categoria
  @BelongsToMany(() => CategoryModel, () => GenreCategoryModel)
  declare categories: CategoryModel[];

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare is_active: boolean;

  @Column({ allowNull: false, type: DataType.DATE(6) })
  declare created_at: Date;
}

export type GenreCategoryModelProps = {
  genre_id: string;
  category_id: string;
};

//tabela pivo, aumenta a performance para retornas o id da categoria junto com o genre
//diminui o numero de joins
@Table({ tableName: 'category_genre', timestamps: false })
export class GenreCategoryModel extends Model<GenreCategoryModelProps> {
  //ForeignKey com GenreModel
  @PrimaryKey
  @ForeignKey(() => GenreModel)
  @Column({ type: DataType.UUID })
  declare genre_id: string;

  //ForeignKey com CategoryModel
  @PrimaryKey
  @ForeignKey(() => CategoryModel)
  @Column({ type: DataType.UUID })
  declare category_id: string;
}
