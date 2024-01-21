import { Either } from '../../../shared/domain/either';
import { NotFoundError } from '../../../shared/domain/errors/not_found';
import { Category, CategoryId } from '../../domain/category.aggregat';
import { ICategoryRepository } from '../../domain/category_repository';

export class CategoriesIdExistsInDatabaseValidator {
  constructor(private categoryRepo: ICategoryRepository) {}

  async validate(
    categories_id: string[],
  ): Promise<Either<CategoryId[], NotFoundError[]>> {
    //para cada valor de id cria um CategoryId
    const categoriesId = categories_id.map((v) => new CategoryId(v));

    //verificar se existe alguma categoria que nao existe no database
    const existsResult = await this.categoryRepo.existsById(categoriesId);
    return existsResult.not_exists.length > 0
      ? Either.fail(
          existsResult.not_exists.map((c) => new NotFoundError(c.id, Category)),
        )
      : Either.ok(categoriesId);
  }
}
