import {
  IsArray,
  IsNotEmpty,
  IsIn,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { FileMediaInput } from '../../common/file-media.input';

export type UploadImageMediasInputConstructorProps = {
  video_id: string;
  field: 'banner' | 'thumbnail' | 'thumbnail_half'; //banner, thumbnail
  file: FileMediaInput;
};

export class UploadImageMediasInput {
  //@IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  video_id: string;

  @IsIn(['banner', 'thumbnail', 'thumbnail_half'])
  @IsNotEmpty()
  field: 'banner' | 'thumbnail' | 'thumbnail_half'; //banner, thumbnail

  @ValidateNested() //validacao da classe FileMediaInput que contem as validacoes do file
  file: FileMediaInput;

  constructor(props: UploadImageMediasInputConstructorProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.field = props.field;
    this.file = props.file;
  }
}

export class ValidateUploadImageMediasInput {
  static validate(input: UploadImageMediasInput) {
    return validateSync(input);
  }
}
