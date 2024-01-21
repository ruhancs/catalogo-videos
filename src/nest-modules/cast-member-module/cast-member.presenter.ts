import { CastMemberOutput } from '@core/cast-member/application/usecases/common/cast-member-output';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/collection.presenter';
import { ListCastMembersOutput } from '@core/cast-member/application/usecases/list-cast-member/list-cast-member.usecase';

export class CastMemberPresenter {
  id: string;
  name: string;
  type: CastMemberTypes;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: CastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.created_at = output.created_at;
  }
}

//CollectionPresenter realiza as transformacoes dos dados de saida
export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new CastMemberPresenter(item));
  }
}
