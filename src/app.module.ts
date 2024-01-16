import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';

@Module({
  //databaseModule contem config do sequelize
  imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule, SharedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
