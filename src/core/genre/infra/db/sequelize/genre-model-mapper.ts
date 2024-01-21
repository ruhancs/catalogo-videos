import { CategoryId } from '../../../../category/domain/category.aggregat';
import { Notification } from '../../../../shared/domain/validators/notification';
import { LoadEntityError } from '../../../../shared/domain/validators/validation_error';
import { Genre, GenreId } from '../../../domain/genre.aggregate';
import { GenreCategoryModel, GenreModel } from './genre-model';

export class GenreModelMapper {
  static toEntity(model: GenreModel) {
    //decompacta dados do GenreModel
    const { genre_id: id, categories_id = [], ...otherData } = model.toJSON();
    //cria um obj CategoryId para cada valor em categories_id
    const categoriesId = categories_id.map(
      (c) => new CategoryId(c.category_id),
    );

    //criar instancia de notificacao de eeros
    const notification = new Notification();
    //se nao tiver nenhuma categoriesId no model:GenreModel, adiciona erros no notification
    if (!categoriesId.length) {
      notification.addError(
        'categories_id should not be empty',
        'categories_id',
      );
    }

    //criar entidade Genre
    const genre = new Genre({
      ...otherData,
      genre_id: new GenreId(id),
      categories_id: new Map(categoriesId.map((c) => [c.id, c])),
    });

    //valida a entidade de genre
    genre.validate();

    //se acontecer algum erro na validacao de genre, inseir os erros de genre.notification, em um so notification
    notification.copyErrors(genre.notification);

    //se tiver algum erro em notification, retorna um erro com todos os erros
    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return genre;
  }

  //transformar agregado Genre em Model do sequelize
  static toModelProps(aggregate: Genre) {
    const { categories_id, ...otherData } = aggregate.toJSON();
    return {
      ...otherData,
      //criar colecao de GenreCategoryModel
      categories_id: categories_id.map(
        (category_id) =>
          //criar um model da tabela pivo entre genre e categories_id
          new GenreCategoryModel({
            genre_id: aggregate.genre_id.id,
            category_id: category_id,
          }),
      ),
    };
  }
}
