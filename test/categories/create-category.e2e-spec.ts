import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateCategoryFixture } from '../../src/nest-modules/categories-module/testing/category-fixture';
import { ICategoryRepository } from '../../src/core/category/domain/category_repository';
import { CATEGORY_PROVIDERS } from '../../src/nest-modules/categories-module/categories.providers';
import { applyGlobalConfig } from '../../src/nest-modules/global-config';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    //configuracao do filters e interceptors
    applyGlobalConfig(app);
    await app.init();
    categoryRepo = app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/categories (POST)', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();
    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const res = await request(app.getHttpServer())
          .post('/categories')
          .send(send_data)
          .expect(201);
        const keysInResponse = CreateCategoryFixture.keysInResponse;
        expect(Object.keys(res.body)).toStrictEqual(['data']);
      },
    );
  });
});
