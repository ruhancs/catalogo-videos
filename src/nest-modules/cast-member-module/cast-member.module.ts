import { Module } from '@nestjs/common';
import { CastmemberController } from './cast-member.controller';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { CAST_MEMBERS_PROVIDERS } from './cast-members.providers';

@Module({
  imports: [SequelizeModule.forFeature([CastMemberModel])],
  controllers: [CastmemberController],
  //pegar somente os valores dos providers instanciados em categories.providers
  providers: [
    ...Object.values(CAST_MEMBERS_PROVIDERS.REPOSITORIES),
    ...Object.values(CAST_MEMBERS_PROVIDERS.USE_CASES),
    ...Object.values(CAST_MEMBERS_PROVIDERS.VALIDATIONS),
  ],
  exports: [
    CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    CAST_MEMBERS_PROVIDERS.VALIDATIONS
      .CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR,
  ],
})
export class CastmemberModule {}
