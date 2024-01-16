import request from 'supertest';
import { CreateCategoryFixture } from '../../src/nest-modules/categories-module/testing/category-fixture';
import { ICategoryRepository } from '../../src/core/category/domain/category_repository';
import { CATEGORY_PROVIDERS } from '../../src/nest-modules/categories-module/categories.providers';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';
import { Uuid } from '@core/shared/domain/value_objects/uuid.vo';
import { CategoriesController } from '../../src/nest-modules/categories-module/categories.controller';
import { CategoryOutputMapper } from '@core/category/application/usecases/common/category-output';
import { instanceToPlain } from 'class-transformer';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    categoryRepo = appHelper.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/categories (POST)', () => {
    describe('Return a response error with 422 status code when request body is invalid', () => {
      const invalidRequest = CreateCategoryFixture.arrangeInvalidRequest();
      //transformar arrange para label: {send_dat:{}, expected: {message:[kasmd], ...}}
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });
    describe('Return a response error with 422 when entity is not valid', () => {
      const invalidRequest =
        CreateCategoryFixture.arrangeForEntityValidationError();
      //transformar arrange para label: {send_dat:{}, expected: {message:[kasmd], ...}}
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });
    const arrange = CreateCategoryFixture.arrangeForCreate();
    describe('Create a category', () => {
      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .post('/categories')
            .send(send_data)
            .expect(201);
          const keysInResponse = CreateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const id = res.body.data.id;
          const categoryCreated = await categoryRepo.findById(new Uuid(id));
          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryCreated),
          );
          //instanceToPlain do class-transformer cria instacia do objeto js
          const serialize = instanceToPlain(presenter);
          expect(res.body.data).toMatchObject({
            id: serialize.id,
            ...expected,
          });
        },
      );
    });
  });
});
