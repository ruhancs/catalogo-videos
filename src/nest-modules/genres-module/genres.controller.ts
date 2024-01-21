import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  ParseUUIDPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genres.dto';
import { UpdateGenreDto } from './dto/update-genres.dto';
import { SearchGenreDto } from './dto/search-genres.dto';
import { GenreCollectionPresenter, GenrePresenter } from './genres.presenter';
import { CreateGenreUseCase } from '../../core/genre/application//usecases/create-genre/create-genre.usecase';
import { UpdateGenreUseCase } from '../../core/genre/application/usecases/update-genre/update-genre.usecase';
import { DeleteGenreUseCase } from '../../core/genre/application/usecases/delete-genre/delete-genre.usecase';
import { GetGenreUseCase } from '../../core/genre/application/usecases/get-genre/get-genre.usecase';
import { ListGenresUseCase } from '../../core/genre/application/usecases/list-genre/list-genres.usecase';
import { UpdateGenreInput } from '../../core/genre/application//usecases/update-genre/update-genre.input';
import { GenreOutput } from '../../core/genre/application/common/genre-output';

@Controller('genres')
export class GenresController {
  @Inject(CreateGenreUseCase)
  private createUseCase: CreateGenreUseCase;

  @Inject(UpdateGenreUseCase)
  private updateUseCase: UpdateGenreUseCase;

  @Inject(DeleteGenreUseCase)
  private deleteUseCase: DeleteGenreUseCase;

  @Inject(GetGenreUseCase)
  private getUseCase: GetGenreUseCase;

  @Inject(ListGenresUseCase)
  private listUseCase: ListGenresUseCase;

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const output = await this.createUseCase.execute(createGenreDto);
    return GenresController.serialize(output);
  }

  @Get()
  async search(@Query() searchParams: SearchGenreDto) {
    const output = await this.listUseCase.execute(searchParams);
    return new GenreCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getUseCase.execute({ id });
    return GenresController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const input = new UpdateGenreInput({ id, ...updateGenreDto });
    const output = await this.updateUseCase.execute(input);
    return GenresController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.deleteUseCase.execute({ id });
  }

  static serialize(output: GenreOutput) {
    return new GenrePresenter(output);
  }
}
