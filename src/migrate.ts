import { NestFactory } from '@nestjs/core';
import { MigrationsModule } from './nest-modules/database-module/migrations.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { migrator } from './core/shared/infra/db/sequelize/migrator';

//proposito do migrate é somente rodar as migracoes
async function bootstrap() {
  //criar uma aplicacao que pode ser customizado como ira rodar as coisas
  const app = await NestFactory.createApplicationContext(MigrationsModule, {
    //mostrar somente logs de error
    logger: ['error'],
  });

  //pegar instancia do sequelize
  const sequelize = app.get(getConnectionToken());

  //migrator criado em core/infra/db, realiza as migracoes
  migrator(sequelize).runAsCLI();
}
bootstrap();
