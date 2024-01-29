import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { VideoAudioMediaUploadedIntegrationEvent } from '@core/video/domain/domain-events/video-audio-media-replaced.event';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import EventEmitter2 from 'eventemitter2';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { EventModule } from 'src/nest-modules/event-module/event.module';
import { SharedModule } from 'src/nest-modules/shared-module/shared.module';
import { VideosModule } from '../videos.module';
import { ApplicationModule } from 'src/nest-modules/application-module/application.module';
import { AuthModule } from 'src/nest-modules/auth-module/auth.module';

//mock rabbitMQmodule, para ser usado no video-module, AmqpConnection é exportado pois o videos-module depende dele
class RabbitmqModuleFake {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModuleFake,
      global: true,
      providers: [
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
      exports: [AmqpConnection],
    };
  }
}

describe('VideosModule Unit Tests', () => {
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        EventModule,
        ApplicationModule,
        DatabaseModule,
        AuthModule,
        RabbitmqModuleFake.forRoot(),
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: () => {
          return new UnitOfWorkFakeInMemory();
        },
      })
      .compile();
    await module.init();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should register handlers', async () => {
    const eventemitter2 = module.get<EventEmitter2>(EventEmitter2);
    //verificar se existe um listener em eventemitter2, para o evento VideoAudioMediaUploadedIntegrationEvent.name
    expect(
      eventemitter2.listeners(VideoAudioMediaUploadedIntegrationEvent.name),
    ).toHaveLength(1);
  });
});
