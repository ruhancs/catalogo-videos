import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validator';
import { CreateCastMemberUseCase } from '../../core/cast-member/application/usecases/create-cast-member/create-cast-member.usecase';
import { DeleteCastMemberUseCase } from '../../core/cast-member/application/usecases/delete-cast-member/delete-cast-member.usecase';
import { GetCastMemberUseCase } from '../../core/cast-member/application/usecases/get-cast-member/get-cast-member.usecase';
import { ListCastMembersUseCase } from '../../core/cast-member/application/usecases/list-cast-member/list-cast-member.usecase';
import { ICastMemberRepository } from '../../core/cast-member/domain/cast-member.repository';
import { CastMemberInMemoryRepository } from '../../core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CastMemberSequelizeRepository } from '../../core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '../../core/cast-member/infra/db/sequelize/cast-member.model';
import { getModelToken } from '@nestjs/sequelize';

//criar instancias dos repositorios criados no core
export const REPOSITORIES = {
  CAST_MEMBER_REPOSITORY: {
    //provider com repositorio default, caso queira utilizar armazenamento em memoria
    provide: 'CastMemberRepository', //para injetar o provider no controller
    //usa CategorySequelizeRepository como padarao
    useExisting: CastMemberSequelizeRepository,
  },
  CAST_MEMBER_IN_MEMORY_REPOSITORY: {
    provide: CastMemberInMemoryRepository,
    useClass: CastMemberInMemoryRepository, //nao precisa factory pois nao possui dependencias
  },
  CAST_MEMBER_SEQUELIZE_REPOSITORY: {
    provide: CastMemberSequelizeRepository,
    useFactory: (castMemberModel: typeof CastMemberModel) => {
      return new CastMemberSequelizeRepository(castMemberModel);
    },
    inject: [getModelToken(CastMemberModel)], //passar o CastMemberModel para factory que ira gerar o repositorio
  },
};

// criar usecases criados no core
export const USE_CASES = {
  CREATE_CAST_MEMBER_USE_CASE: {
    provide: CreateCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new CreateCastMemberUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide], //pegar o repositorio
  },
  /*
  UPDATE_CAST_MEMBER_USE_CASE: {
    provide: UpdateCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new UpdateCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  */
  LIST_CAST_MEMBER_USE_CASE: {
    provide: ListCastMembersUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new ListCastMembersUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  GET_CAST_MEMBER_USE_CASE: {
    provide: GetCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new GetCastMemberUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  DELETE_CAST_MEMBER_USE_CASE: {
    provide: DeleteCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new DeleteCastMemberUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
};

export const VALIDATIONS = {
  CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
    provide: CastMembersIdExistsInDatabaseValidator,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new CastMembersIdExistsInDatabaseValidator(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
};

export const CAST_MEMBERS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  VALIDATIONS,
};
