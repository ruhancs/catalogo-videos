import { IUseCase } from '@core/shared/application/use-case.interface';
import { VideoId, Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { NotFoundError } from '@core/shared/domain/errors/not_found';
import { ProcessAudioVideoMediasInput } from './proccess-audio-video-medias.input';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';

export class ProccessAudioVideoMediasUseCase
  implements
    IUseCase<ProcessAudioVideoMediasInput, ProcessAudioVideoMediasOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
  ) {}
  async execute(
    input: ProcessAudioVideoMediasInput,
  ): Promise<ProcessAudioVideoMediasOutput> {
    //verificar se os dados de video existe no db
    const video = await this.videoRepo.findById(new VideoId(input.video_id));
    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    if (input.field === 'trailer') {
      if (!video.trailer) {
        throw new Error('Trailer not found');
      }
      // se o status recebido pelo input for completed,
      //atualiza o vo Traile de Video para completado e adiciona a localizacao do caminho do trailer
      //caso status nao for completed cria vo com status fail no video
      video.trailer =
        input.status === AudioVideoMediaStatus.COMPLETED
          ? video.trailer.complete(input.encoded_location)
          : video.trailer.fail();
    }

    if (input.field === 'video') {
      if (!video.video) {
        throw new Error('Video not found');
      }
      // se o status recebido pelo input for completed,
      //atualiza o vo Traile de Video para completado e adiciona a localizacao do caminho do trailer
      //caso status nao for completed cria vo com status fail no video
      video.video =
        input.status === AudioVideoMediaStatus.COMPLETED
          ? video.video.complete(input.encoded_location)
          : video.video.fail();
    }

    await this.uow.do(async () => {
      await this.videoRepo.update(video);
    });
  }
}

export type ProcessAudioVideoMediasOutput = Promise<void>;
