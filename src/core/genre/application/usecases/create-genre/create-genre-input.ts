import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  validateSync,
} from 'class-validator';

export type CreateGenreInputConstructorProps = {
  name: string;
  categories_id: string[];
  is_active?: boolean;
};

export class CreateGenreInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  //versao 4 do uuid, each para varrer todos itens do array e validar
  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categories_id: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  constructor(props?: CreateGenreInputConstructorProps) {
    if (!props) return;
    this.name = props.name;
    this.categories_id = props.categories_id;
    this.is_active = props.is_active ?? true;
  }
}

export class ValidateCreateGenreInput {
  static validate(input: CreateGenreInput) {
    return validateSync(input);
  }
}
