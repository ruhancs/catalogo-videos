import { SortDirection } from '../../../core/shared/domain/repository/search-params';
import { ListCategoriesInput } from '../../../core/category/application/usecases/list-category/list-category.usecase';

export class SearchCategoriesDto implements ListCategoriesInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  filter?: string;
}
