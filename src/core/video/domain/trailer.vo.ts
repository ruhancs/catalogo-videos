import { Either } from '@core/shared/domain/either';
import { MediaFileValidator } from '@core/shared/domain/validators/media-file.validator';
import {
  AudioVideoMedia,
  AudioVideoMediaStatus,
} from '@core/shared/domain/value-objects/audio-video-media.vo';
import { VideoId } from '@core/video/domain/video.aggregate';

export class Trailer extends AudioVideoMedia {
  static max_size = 1024 * 1024 * 500; //tamanho maximo de 500MB
  static mime_types = ['video/mp4'];

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
      Trailer.max_size,
      Trailer.mime_types,
    );

    return Either.safe(() => {
      const { name: newName } = mediaFileValidator.validate({
        raw_name,
        mime_type,
        size,
      });
      return Trailer.create({
        name: `${video_id.id}-${newName}`,
        raw_location: `videos/${video_id.id}/videos`,
      });
    });
  }

  static create({ name, raw_location }) {
    return new Trailer({
      name,
      raw_location,
      status: AudioVideoMediaStatus.PENDING,
    });
  }

  proccess() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location!,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encoded_location: string) {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location!,
      status: AudioVideoMediaStatus.FAILED,
    });
  }
}
