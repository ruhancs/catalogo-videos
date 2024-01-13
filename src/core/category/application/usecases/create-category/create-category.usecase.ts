import { IUseCase } from "../../../../shared/application/use-case.interface";
import { EntityValidationError } from "../../../../shared/domain/validators/validation_error";
import { Category } from "../../../domain/category.entity";
import { ICategoryRepository } from "../../../domain/category_repository";
import { CategoryOutputMapper } from "../common/category-output";
import { CreateCategoryInput } from "./create-category-input";

export class CreateCategoryUseCase
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const entity = Category.create(input);

    if (entity.notification.hasErrors()) { // Category.create valida
      throw new EntityValidationError(entity.notification.toJSON());
    }

    await this.categoryRepo.insert(entity);

    return CategoryOutputMapper.toOutput(entity);
  }
}

export type CreateCategoryOutput = {
    id: string
    name: string
    description?: string|null
    is_active?: boolean
    created_at: Date
}