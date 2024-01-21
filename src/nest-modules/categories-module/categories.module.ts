import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { CATEGORY_PROVIDERS } from './categories.providers';

//se o modulo for carregado so em determinados momentos, para melhorar a performance utilizar lazy modules
//que carrega os modulos sob demanda, o modulo so é executado quando for utilizado

@Module({
  imports: [SequelizeModule.forFeature([CategoryModel])],
  controllers: [CategoriesController],
  //pegar somente os valores dos providers instanciados em categories.providers
  providers: [
    ...Object.values(CATEGORY_PROVIDERS.REPOSITORIES),
    ...Object.values(CATEGORY_PROVIDERS.USE_CASES),
    ...Object.values(CATEGORY_PROVIDERS.VALIDATIONS),
  ],
  //exports providers que poderao ser utilizados em outros servicos
  exports: [
    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
      .provide,
  ],
})
export class CategoriesModule {}
