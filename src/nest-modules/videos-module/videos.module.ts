import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesModule } from '../categories-module/categories.module';
import { VIDEOS_PROVIDERS } from './videos.providers';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../../core/video/infra/db/sequelize/video.model';
import { ImageMediaModel } from '../../core/video/infra/db/sequelize/image-media.model';
import { AudioVideoMediaModel } from '../../core/video/infra/db/sequelize/audio-video-media.model';
import { GenresModule } from '../genres-module/genres-module.module';
import { CastmemberModule } from '../cast-member-module/cast-member.module';
import { RabbitmqModule } from '../rabbitmq-module/rabbitmq.module';
import { VideosConsumers } from './videos.consumers';
//import { RabbitmqModule } from '../rabbitmq-module/rabbitmq.module';
//import { VideosConsumers } from './videos.consumers';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VideoModel,
      VideoCategoryModel,
      VideoGenreModel,
      VideoCastMemberModel,
      ImageMediaModel,
      AudioVideoMediaModel,
    ]),
    //RabbitmqModule.forFeature(),
    CategoriesModule, //importa tudo que esta sendo exportado do modulo, acessar provider de VALIDATION
    GenresModule,
    CastmemberModule,
    RabbitmqModule.forFeature(), //acesso ao servico de publicacao
  ],
  controllers: [VideosController],
  providers: [
    ...Object.values(VIDEOS_PROVIDERS.REPOSITORIES),
    ...Object.values(VIDEOS_PROVIDERS.USE_CASES),
    ...Object.values(VIDEOS_PROVIDERS.HANDLERS),
    VideosConsumers, //consumir fila do rabbitmq
  ],
  //exports: [VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide],
})
export class VideosModule {}
