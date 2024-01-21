import { getModelToken } from '@nestjs/sequelize';
import { CategoryInMemoryRepository } from '../../core/category/infra/db/in-memory/category-in-memory.repository';
import { CreateCategoryUseCase } from '../../core/category/application/usecases/create-category/create-category.usecase';
import { DeleteCategoryUseCase } from '../../core/category/application/usecases/delete-category/delete-category.usecase';
import { GetCategoryUseCase } from '../../core/category/application/usecases/get-category/get-category.usecase';
import { ListCategoriesUseCase } from '../../core/category/application/usecases/list-category/list-category.usecase';
import { UpdateCategoryUseCase } from '../../core/category/application/usecases/update-category/update-category.usecase';
import { ICategoryRepository } from '../../core/category/domain/category_repository';
import { CategoryModel } from '../../core/category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '../../core/category/infra/db/sequelize/category_sequelize.repository';
import { CategoriesIdExistsInDatabaseValidator } from '../../core/category/application/validations/categories-ids-exists-in-database.validator';

//criar instancias dos repositorios criados no core
export const REPOSITORIES = {
  CATEGORY_REPOSITORY: {
    //provider com repositorio default, caso queira utilizar armazenamento em memoria
    provide: 'CategoryRepository', //para injetar o provider no controller
    //usa CategorySequelizeRepository como padarao
    useExisting: CategorySequelizeRepository,
  },
  CATEGORY_IN_MEMORY_REPOSITORY: {
    provide: CategoryInMemoryRepository,
    useClass: CategoryInMemoryRepository, //nao precisa factory pois nao possui dependencias
  },
  CATEGORY_SEQUELIZE_REPOSITORY: {
    provide: CategorySequelizeRepository,
    useFactory: (categoryModel: typeof CategoryModel) => {
      return new CategorySequelizeRepository(categoryModel);
    },
    inject: [getModelToken(CategoryModel)], //passar o CategoryModel para factory que ira gerar o repositorio
  },
};

// criar usecases criados no core
export const USE_CASES = {
  CREATE_CATEGORY_USE_CASE: {
    provide: CreateCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new CreateCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide], //pegar o repositorio
  },
  UPDATE_CATEGORY_USE_CASE: {
    provide: UpdateCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new UpdateCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  LIST_CATEGORIES_USE_CASE: {
    provide: ListCategoriesUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new ListCategoriesUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  GET_CATEGORY_USE_CASE: {
    provide: GetCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new GetCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  DELETE_CATEGORY_USE_CASE: {
    provide: DeleteCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new DeleteCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
};

export const VALIDATIONS = {
  CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
    provide: CategoriesIdExistsInDatabaseValidator,
    //injetar categoryRepo em CategoriesIdExistsInDatabaseValidator
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new CategoriesIdExistsInDatabaseValidator(categoryRepo);
    },
    // repositorio que sera injetado quando CategoriesIdExistsInDatabaseValidator for instanciado
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
};

export const CATEGORY_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  VALIDATIONS,
};
