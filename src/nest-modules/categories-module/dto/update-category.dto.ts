import { UpdateCategoryInput } from '@core/category/application/usecases/update-category/update-category-input';
import { OmitType } from '@nestjs/mapped-types';

//remove o id de UpdateCategoryInput, pois o id sera recebido na rota nao no body
export class UpdateCategoryInputWithoutId extends OmitType(
  UpdateCategoryInput,
  ['id'] as const,
) {}

//remove o id de UpdateCategoryInput, pois o id sera recebido na rota nao no body
export class UpdateCategoryDto extends UpdateCategoryInputWithoutId {}
