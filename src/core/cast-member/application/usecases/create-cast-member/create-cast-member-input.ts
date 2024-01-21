import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { IsInt, IsNotEmpty, IsString, validateSync } from 'class-validator';

export type CastMemberConstructorInputProps = {
  name: string;
  type: CastMemberTypes;
};

export class CreateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  type: CastMemberTypes;

  constructor(input: CastMemberConstructorInputProps) {
    if (!input) return;
    this.name = input.name;
    this.type = input.type;
  }
}
export class ValidateCreateCastMemberInput {
  static validate(input: CreateCastMemberInput) {
    return validateSync(input);
  }
}
