import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genres.dto';

export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
