import { CategoriesIdExistsInDatabaseValidator } from '../../../../category/application/validations/categories-ids-exists-in-database.validator';
import { ICategoryRepository } from '../../../../category/domain/category_repository';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/not_found';
import { IUnitOfWork } from '../../../../shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '../../../../shared/domain/validators/validation_error';
import { Genre, GenreId } from '../../../domain/genre.aggregate';
import { IGenreRepository } from '../../../domain/genre-repository';
import { GenreOutput, GenreOutputMapper } from '../../common/genre-output';
import { UpdateGenreInput } from './update-genre.input';

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
    private categoriesIdExistsInStorageValidator: CategoriesIdExistsInDatabaseValidator,
  ) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepo.findById(genreId);

    if (!genre) {
      throw new NotFoundError(input.id, Genre);
    }

    //se o dado de name for inserido no input atualiza o genre
    input.name && genre.changeName(input.name);

    //se tiver dado de is_active na input, ativa o genre
    if (input.is_active === true) {
      genre.activate();
    }

    //se tiver dado de is_active = false na input, desativa o genre
    if (input.is_active === false) {
      genre.deactivate();
    }

    //verificar se ha algum erro de validacao em genre
    const notification = genre.notification;

    //se houver dados de categories_id na input, verifica se as categorias estao criadas no db,
    //e inseri as  categorias validas em categoriesId e as nao validas em errorsCategoriesId, transaforma em array
    if (input.categories_id) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdExistsInStorageValidator.validate(
          input.categories_id,
        )
      ).asArray();

      //se foi passado categorias validas atualiza todas categorias de genre
      categoriesId && genre.syncCategoriesId(categoriesId);

      //se alguma categoria nao foi encontrada no db, inseri o id das categorias que nao foram encontradas em notification
      errorsCategoriesId &&
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categories_id',
        );
    }

    //verificar se existe erro em notification
    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    //fazer a operacao de update de genre no db
    await this.uow.do(async () => {
      return this.genreRepo.update(genre);
    });

    //buscar as categorias que foram inseridas em genre, para utilizar na saida
    const categories = await this.categoryRepo.findByIds(
      Array.from(genre.categories_id.values()), //transaforma o Map<string, obj(categoryId)> em array de string com id de categorias
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type UpdateGenreOutput = GenreOutput;
