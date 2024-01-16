import { ICategoryRepository } from '../../../core/category/domain/category_repository';
import { CategoriesController } from '../categories.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../../config-module/config.module';
import { DatabaseModule } from '../../database-module/database.module';
import { CategoriesModule } from '../categories.module';
import { CATEGORY_PROVIDERS } from '../categories.providers';
import { CreateCategoryUseCase } from '../../../core/category/application/usecases/create-category/create-category.usecase';
import { UpdateCategoryUseCase } from '../../../core/category/application/usecases/update-category/update-category.usecase';
import { DeleteCategoryUseCase } from '../../../core/category/application/usecases/delete-category/delete-category.usecase';
import { GetCategoryUseCase } from '../../../core/category/application/usecases/get-category/get-category.usecase';
import { ListCategoriesUseCase } from '../../../core/category/application/usecases/list-category/list-category.usecase';
import { CategoryOutputMapper } from '../../../core/category/application/usecases/common/category-output';
import { Category } from '../../../core/category/domain/category.entity';
import {
  CategoryPresenter,
  CategoryCollectionPresenter,
} from '../categories.presenter';
import {
  CreateCategoryFixture,
  UpdateCategoryFixture,
  ListCategoriesFixture,
} from '../testing/category-fixture';
import { Uuid } from '@core/shared/domain/value_objects/uuid.vo';

describe('Categories Controller Integration Tests', () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();
    controller = module.get<CategoriesController>(CategoriesController); //pegar o controller
    //pegar o nome do repositorio, para instancialo
    repository = module.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateCategoryUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateCategoryUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteCategoryUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetCategoryUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListCategoriesUseCase);
  });

  describe('should create a category', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();
    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.create(send_data);
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity!.toJSON()).toMatchObject({
          category_id: presenter.id,
          ...expected,
        });
        const output = CategoryOutputMapper.toOutput(entity!);
        const presenterToCompare = new CategoryPresenter(output);
        expect(presenter.name).toEqual(presenterToCompare.name);
        expect(presenter.description).toEqual(presenterToCompare.description);
        expect(presenter.is_active).toEqual(presenterToCompare.is_active);
        expect(presenter.id).toEqual(presenterToCompare.id);
      },
    );
  });

  describe('should update a category', () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();

    const category = Category.fake().aCategory().build();

    beforeEach(async () => {
      await repository.insert(category);
    });

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.update(
          category.category_id.id,
          send_data,
        );
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity!.toJSON()).toMatchObject({
          category_id: presenter.id,
          name: expected.name ?? category.name,
          description:
            'description' in expected
              ? expected.description
              : category.description,
          is_active:
            expected.is_active === true || expected.is_active === false
              ? expected.is_active
              : category.is_active,
        });
        const output = CategoryOutputMapper.toOutput(entity!);
        const presenterToCompare = new CategoryPresenter(output);
        expect(presenter.name).toEqual(presenterToCompare.name);
        expect(presenter.description).toEqual(presenterToCompare.description);
        expect(presenter.is_active).toEqual(presenterToCompare.is_active);
        expect(presenter.id).toEqual(presenterToCompare.id);
      },
    );
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const response = await controller.remove(category.category_id.id);
    expect(response).not.toBeDefined();
    await expect(repository.findById(category.category_id)).resolves.toBeNull();
  });

  it('should get a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const presenter = await controller.findOne(category.category_id.id);

    expect(presenter.id).toBe(category.category_id.id);
    expect(presenter.name).toBe(category.name);
    expect(presenter.description).toBe(category.description);
    expect(presenter.is_active).toBe(category.is_active);
  });

  describe('search method', () => {
    describe('should sorted categories by created_at', () => {
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('should return categories using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });
  });
});
