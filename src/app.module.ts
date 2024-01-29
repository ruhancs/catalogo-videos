import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { CastmemberModule } from './nest-modules/cast-member-module/cast-member.module';
import { GenresModule } from './nest-modules/genres-module/genres-module.module';
import { VideosModule } from './nest-modules/videos-module/videos.module';
import { EventModule } from './nest-modules/event-module/event.module';
import { ApplicationModule } from './nest-modules/application-module/application.module';
//import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqFakeConsumer } from './nest-modules/rabbitmq-test/rabbitmq-fake-consumer';
import { RabbitmqModule } from './nest-modules/rabbitmq-module/rabbitmq.module';
import { AuthModule } from './nest-modules/auth-module/auth.module';

@Module({
  //databaseModule contem config do sequelize
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    SharedModule,
    EventModule,
    RabbitmqModule.forRoot(),
    AuthModule,
    ApplicationModule,
    CastmemberModule,
    GenresModule,
    VideosModule,
    //teste com rabbitmq
    /*
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: 'amqp://admin:admin@localhost:5672',
    }),
    */
  ],
  controllers: [],
  providers: [RabbitMqFakeConsumer],
})
export class AppModule {}
