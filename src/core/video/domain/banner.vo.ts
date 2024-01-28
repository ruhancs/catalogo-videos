import { Either } from '@core/shared/domain/either';
import { MediaFileValidator } from '@core/shared/domain/validators/media-file.validator';
import { ImageMedia } from '@core/shared/domain/value-objects/image-media.vo';
import { VideoId } from './video.aggregate';

export class Banner extends ImageMedia {
  static max_size = 1024 * 1024 * 2; //tamanho maximo de 2MB
  static mime_types = ['image/jpeg', 'image/png', 'image/gif'];

  //recebe os dados da imagem
  static createFromFile({
    raw_name,
    mime_type,
    size,
    video_id,
  }: {
    raw_name: string;
    mime_type: string;
    size: number;
    video_id: VideoId;
  }) {
    //validar tamanho e mime type
    //gerar nome aleatorio
    const mediaFileValidator = new MediaFileValidator(
      Banner.max_size,
      Banner.mime_types,
    );

    return Either.safe(() => {
      const { name: newName } = mediaFileValidator.validate({
        raw_name,
        mime_type,
        size,
      });
      return new Banner({
        name: newName,
        location: `videos/${video_id.id}/images`,
      });
    });
  }
}
