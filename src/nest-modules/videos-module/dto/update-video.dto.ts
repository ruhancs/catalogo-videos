import { OmitType } from '@nestjs/mapped-types';
import { UpdateVideoInput } from '@core/video/application/use-cases/update-video/update-video.input';

export class UpdateVideoWithoutId extends OmitType(UpdateVideoInput, [
  'id',
] as any) {}

export class UpdateVideoDto extends UpdateVideoWithoutId {}
