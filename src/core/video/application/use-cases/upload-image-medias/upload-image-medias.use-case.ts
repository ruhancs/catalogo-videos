import { IUseCase } from '../../../../shared/application/use-case.interface';
import { UploadImageMediasInput } from './upload-image-medias.input';
import { NotFoundError } from '../../../../shared/domain/errors/not_found';
import { IVideoRepository } from '../../../../video/domain/video.repository';
import { Video, VideoId } from '../../../../video/domain/video.aggregate';
import { Banner } from '@core/video/domain/banner.vo';
import { Thumbnail } from '@core/video/domain/thumbnail.vo';
import { ThumbnailHalf } from '@core/video/domain/thumbnail-half.vo';
import { EntityValidationError } from '@core/shared/domain/validators/validation_error';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { IStorage } from '@core/shared/application/storage.interface';

export class UploadImageMediasUseCase
  implements IUseCase<UploadImageMediasInput, UploadImageMediasOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadImageMediasInput,
  ): Promise<UploadImageMediasOutput> {
    //verificar se video existe
    const videoId = new VideoId(input.video_id);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    //verificar o tipo da imagem que se quer inserir
    const imagesMap = {
      banner: Banner,
      thubnail: Thumbnail,
      thubnail_half: ThumbnailHalf,
    };

    //Banner,Thumbnail e ThumbnailHalf possuem a funcao createFromFile para criar o vo
    //createFromFile retorna um either com o vo ou errorImage
    const [image, errorImage] = imagesMap[input.field]
      .createFromFile({
        //...input.file
        raw_name: input.file.raw_name,
        mime_type: input.file.mime_type,
        size: input.file.size,
        video_id: videoId,
      })
      .asArray();

    if (errorImage) {
      throw new EntityValidationError([
        {
          [input.field]: [errorImage.message],
        },
      ]);
    }

    //verificar qual vo é a image e atualizar o video
    image instanceof Banner && video.replaceBanner(image);
    image instanceof Thumbnail && video.replaceThumbnail(image);
    image instanceof ThumbnailHalf && video.replaceThumbnailHalf(image);

    //armazenar imagem na bucket
    await this.storage.store({
      data: input.file.data, //buffer conteudo da imagem
      mime_type: input.file.mime_type,
      id: image.url, // caminho do armazenamento ex:videos/uuid/imagens/nome-arquivo.png
    });

    //caso o video de problema para atualizar, pode se adicionar um try catch para deletar a imagem da bucket
    await this.uow.do(async () => {
      await this.videoRepo.update(video);
    });
  }
}

export type UploadImageMediasOutput = void;
