import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { CastMemberTypes } from '../../../domain/cast-member-type.vo';
import { IsInt, ValidateNested, validateSync } from 'class-validator';

export class ListCastMembersFilter {
  name?: string | null;
  @IsInt()
  type?: CastMemberTypes | null;
}

export class ListCastMembersInput {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  @ValidateNested()
  filter?: ListCastMembersFilter;
}

export class ValidateListCastMembersInput {
  static validate(input: ListCastMembersInput) {
    return validateSync(input);
  }
}
