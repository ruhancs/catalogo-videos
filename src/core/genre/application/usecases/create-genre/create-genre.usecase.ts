import { CategoriesIdExistsInDatabaseValidator } from '../../../../category/application/validations/categories-ids-exists-in-database.validator';
import { ICategoryRepository } from '../../../../category/domain/category_repository';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { IUnitOfWork } from '../../../../shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '../../../../shared/domain/validators/validation_error';
import { Genre } from '../../../domain/genre.aggregate';
import { IGenreRepository } from '../../../domain/genre-repository';
import { GenreOutput, GenreOutputMapper } from '../../common/genre-output';
import { CreateGenreInput } from './create-genre-input';

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
    private categoriesIdExistsInStorage: CategoriesIdExistsInDatabaseValidator,
  ) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    //verificar quais ids de categoria estao armazenados no db e quais nao
    const [categoriesId, errorsCategoriesIds] = (
      await this.categoriesIdExistsInStorage.validate(input.categories_id)
    ).asArray();

    //desmebrar de input o name e is_active
    const { name, is_active } = input;

    //criar agregado genre com os ids de category validos
    const entity = Genre.create({
      name,
      //se tiver algum categoryId que nao existe no db retorna um array vazio, para levantar erro em notification
      categories_id: errorsCategoriesIds ? [] : categoriesId,
      is_active,
    });

    const notification = entity.notification;

    //se tiver erro em algum categoryId inseri o erro em notification
    if (errorsCategoriesIds) {
      notification.setError(
        errorsCategoriesIds.map((e) => e.message),
        'categories_id',
      );
    }

    //se tiver algum erro em notification retorna o erro
    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    //caso nao ocorra erros realiza as operacoes no banco de dados
    await this.uow.do(async () => {
      return this.genreRepo.insert(entity);
    });

    //buscar as categorias pelos ids do genre criado
    const categories = await this.categoryRepo.findByIds(
      //transformar os valores do obj de categoryId em array de ids
      Array.from(entity.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(entity, categories);
  }
}

export type CreateGenreOutput = GenreOutput;
