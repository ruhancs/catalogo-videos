import { IStorage } from '../../../../shared/application/storage.interface';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/not_found';
import { EntityValidationError } from '../../../../shared/domain/validators/validation_error';
import { Trailer } from '../../../domain/trailer.vo';
import { VideoMedia } from '../../../domain/video-media.vo';
import { Video, VideoId } from '../../../domain/video.aggregate';
import { IVideoRepository } from '../../../domain/video.repository';
import { UploadAudioVideoMediaInput } from './upload-audio-video-medias.input';
import { ApplicationService } from '@core/shared/application/application.service';

export class UploadAudioVideoMediasUseCase
  implements IUseCase<UploadAudioVideoMediaInput, UploadAudioVideoMediaOutput>
{
  constructor(
    private appService: ApplicationService,
    private videoRepo: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadAudioVideoMediaInput,
  ): Promise<UploadAudioVideoMediaOutput> {
    //verificar se os dados de video existe no db
    const video = await this.videoRepo.findById(new VideoId(input.video_id));
    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    //tipos de video que pode ser recebidos no input
    const audioVideoMediaMap = {
      trailer: Trailer,
      video: VideoMedia,
    };

    //adicionar tipagem ao tipo de arquivo do input
    const audioMediaClass = audioVideoMediaMap[input.field] as
      | typeof Trailer
      | typeof VideoMedia;
    //criar o vo do tipo de arquivo do input, e verificar se existe algum erro na validacao
    const [audioVideoMedia, errorAudioMedia] = audioMediaClass
      .createFromFile({
        ...input.file,
        video_id: video.video_id,
      })
      .asArray();

    //verificar se houve erros na instanciacao do vo
    if (errorAudioMedia) {
      throw new EntityValidationError([
        {
          [input.field]: [errorAudioMedia.message],
        },
      ]);
    }

    //verificar o tipo do arquivo de video midia se é trailer ou video, e atualizar o agregado de video
    audioVideoMedia instanceof Trailer && video.replaceTrailer(audioVideoMedia);
    audioVideoMedia instanceof VideoMedia &&
      video.replaceVideo(audioVideoMedia);

    // enviar o arquivo de midia para a bucket
    await this.storage.store({
      data: input.file.data, // arquivo de video ou trailer
      id: audioVideoMedia.raw_url, //nome do arquivo e caminho de armazenamento na bucket
      mime_type: input.file.mime_type, // tipo do arquivo
    });

    //executa os eventos do agregado e arante consistencia nas transacoes
    await this.appService.run(async () => {
      return this.videoRepo.update(video);
    });
  }
}

export type UploadAudioVideoMediaOutput = void;
