import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { Category } from '@core/category/domain/category.aggregat';
import { ICategoryRepository } from '@core/category/domain/category_repository';
import { IGenreRepository } from '@core/genre/domain/genre-repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '@core/shared/infra/message-broker/events-message-broker-config';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { VideoAudioMediaUploadedIntegrationEvent } from '@core/video/domain/domain-events/video-audio-media-replaced.event';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/sequelize';
import { TestingModule, Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-member-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { EventModule } from 'src/nest-modules/event-module/event.module';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.providers';
import { RabbitmqModule } from 'src/nest-modules/rabbitmq-module/rabbitmq.module';
import { SharedModule } from 'src/nest-modules/shared-module/shared.module';
import { VideosModule } from '../videos.module';
import { VIDEOS_PROVIDERS } from '../videos.providers';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { ApplicationModule } from 'src/nest-modules/application-module/application.module';

//verificar se o evento esta sendo publicado no rabbitmq
describe('PublishVideoMediaReplacedInQueueHandler Integration Tests', () => {
  let module: TestingModule;
  let channelWrapper: ChannelWrapper;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        DatabaseModule,
        EventModule,
        ApplicationModule,
        RabbitmqModule.forRoot(),
        //AuthModule,
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .compile();
    await module.init();

    const amqpConn = module.get<AmqpConnection>(AmqpConnection);
    channelWrapper = amqpConn.managedConnection.createChannel();
    await channelWrapper.addSetup((channel) => {
      return Promise.all([
        channel.assertQueue('test-queue-video-upload', {
          durable: false,
        }),
        channel.bindQueue(
          'test-queue-video-upload',
          EVENTS_MESSAGE_BROKER_CONFIG[
            VideoAudioMediaUploadedIntegrationEvent.name
          ].exchange,
          EVENTS_MESSAGE_BROKER_CONFIG[
            VideoAudioMediaUploadedIntegrationEvent.name
          ].routing_key,
        ),
        //purgeQueue apaga todas msg recebidas no rabbitmq limpa a fila
      ]).then(() => channel.purgeQueue('test-queue-video-upload'));
    });
  });

  afterEach(async () => {
    await channelWrapper.close();
    await module.close();
  });

  it('should publish video media replaced event in queue', async () => {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().aDirector().build();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    const categoryRepo: ICategoryRepository = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    await categoryRepo.insert(category);

    const genreRepo: IGenreRepository = module.get(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    await genreRepo.insert(genre);

    const castMemberRepo: ICastMemberRepository = module.get(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
    await castMemberRepo.insert(castMember);

    const videoRepo: IVideoRepository = module.get(
      VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
    );
    await videoRepo.insert(video);

    const useCase: UploadAudioVideoMediasUseCase = module.get(
      VIDEOS_PROVIDERS.USE_CASES.UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE.provide,
    );

    await useCase.execute({
      video_id: video.video_id.id,
      field: 'video',
      file: {
        data: Buffer.from('data'),
        mime_type: 'video/mp4',
        raw_name: 'video.mp4',
        size: 100,
      },
    });

    const msg: ConsumeMessage = await new Promise((resolve) => {
      channelWrapper.consume('test-queue-video-upload', (msg) => {
        resolve(msg);
      });
    });

    const msgObj = JSON.parse(msg.content.toString());
    const updatedVideo = await videoRepo.findById(video.video_id);
    expect(msgObj).toEqual({
      resource_id: `${video.video_id.id}.video`,
      file_path: updatedVideo?.video?.raw_url,
    });
  });
});
