import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export type UpdateCategoryInputProps = {
  id: string;
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

export class UpdateCategoryInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  constructor(props: UpdateCategoryInputProps) {
    if (!props) return;
    props.name && (this.name = props.name);
    props.description && (this.description = props.description);
    props.is_active != null &&
      props.is_active != undefined &&
      (this.is_active = props.is_active);
  }
}

export class ValidateCreateCategoryInput {
  static validate(input: UpdateCategoryInput) {
    return validateSync(input);
  }
}
