import { Category } from '../../../domain/category.aggregat';

export type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

export class CategoryOutputMapper {
  static toOutput(entity: Category): CategoryOutput {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category_id, ...otherProps } = entity.toJSON();
    return {
      id: entity.category_id.id,
      ...otherProps,
    };
  }
}
