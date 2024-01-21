import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre-model';
import { CastMemberModel } from '../../core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryModel } from '../../core/category/infra/db/sequelize/category.model';
import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule, getConnectionToken } from '@nestjs/sequelize';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config-module/config.module';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Sequelize } from 'sequelize-typescript';

const models = [CategoryModel, CastMemberModel, GenreModel, GenreCategoryModel];

//modulo de configuracoes do db
@Global() //tornar o modulo acessivel globalmente
@Module({
  imports: [
    //criar instancia do sequelize, forRootAsync adiciona delay para arquivos env serem carregados
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get('DB_VENDOR');
        if (dbVendor === 'sqlite') {
          return {
            dialect: 'sqlite',
            host: configService.get('DB_HOST'),
            models: models,
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }
        if (dbVendor === 'mysql') {
          return {
            dialect: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            database: configService.get('DB_DATABASE'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            models: models,
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }

        throw new Error(`Invalid database config: ${dbVendor}`);
      },
      inject: [ConfigService],
    }),
  ],
  //registrar unit of work como scope, que cria uma instancia de unit of work por request
  providers: [
    {
      provide: UnitOfWorkSequelize,
      //factory do unit of work
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      //pegar instancia do sequelize do connection token e inserir na usefactory de UnitOfWorkSequelize
      inject: [getConnectionToken()],
      //criar uma instancia por requisicao
      scope: Scope.REQUEST,
    },
    {
      //replica do unit of work, para chamar apenas pelo nome
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
    },
  ],
  exports: ['UnitOfWork'],
})
export class DatabaseModule {}
