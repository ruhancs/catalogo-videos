import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '@core/cast-member/application/usecases/common/cast-member-output';
import { CreateCastMemberInput } from '@core/cast-member/application/usecases/create-cast-member/create-cast-member-input';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation_error';

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private castMemberRepo: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CastMemberOutput> {
    //either(monad) valida o objeto de valor de CastMemberType, se tiver erros retorna
    const [type, errorCastMemberType] = CastMemberType.create(
      input.type,
    ).asArray();
    const entity = CastMember.create({
      ...input,
      type,
    });
    //notification possui todos erros de validacao da entidade
    const notification = entity.notification;
    //se CastMemberType retornar algum erro de validacao inseri os erros em notification
    if (errorCastMemberType) {
      notification.setError(errorCastMemberType.message, 'type');
    }

    //verificar se ha erros em notification
    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.castMemberRepo.insert(entity);
    return CastMemberOutputMapper.toOutput(entity);
  }
}

export type CreateCastMemberOutput = CastMemberOutput;
