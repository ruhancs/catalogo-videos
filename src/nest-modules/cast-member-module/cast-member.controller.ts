import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Inject,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CreateCastMemberDto } from './dto/create-castmember.dto';
import { CreateCastMemberUseCase } from '@core/cast-member/application/usecases/create-cast-member/create-cast-member.usecase';
import { GetCastMemberUseCase } from '@core/cast-member/application/usecases/get-cast-member/get-cast-member.usecase';
import { ListCastMembersUseCase } from '@core/cast-member/application/usecases/list-cast-member/list-cast-member.usecase';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/usecases/delete-cast-member/delete-cast-member.usecase';
import { CastMemberOutput } from '@core/cast-member/application/usecases/common/cast-member-output';
import { SearchCastMemberDto } from './dto/search-castmember.dto';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from './cast-member.presenter';

@Controller('cast-members')
export class CastmemberController {
  @Inject(CreateCastMemberUseCase)
  private createUseCase: CreateCastMemberUseCase;

  @Inject(GetCastMemberUseCase)
  private getUseCase: GetCastMemberUseCase;

  @Inject(ListCastMembersUseCase)
  private listUseCase: ListCastMembersUseCase;

  @Inject(DeleteCastMemberUseCase)
  private deleteUseCase: DeleteCastMemberUseCase;

  @Post()
  async create(@Body() createCastmemberDto: CreateCastMemberDto) {
    const output = await this.createUseCase.execute(createCastmemberDto);
    return CastmemberController.serialize(output);
  }

  @Get()
  async search(@Query() searchParamsDto: SearchCastMemberDto) {
    const castMembers = await this.listUseCase.execute(searchParamsDto);
    return new CastMemberCollectionPresenter(castMembers);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getUseCase.execute({ id: id });
    return CastmemberController.serialize(output);
  }

  /*
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCastmemberDto: UpdateCastmemberDto,
  ) {
    return this.castmemberService.update(+id, updateCastmemberDto);
  }
  */

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    await this.deleteUseCase.execute({ id: id });
  }

  static serialize(output: CastMemberOutput) {
    return new CastMemberPresenter(output);
  }
}
