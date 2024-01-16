import { CategoryOutput } from '@core/category/application/usecases/common/category-output';
import { ListCategoriesOutput } from '@core/category/application/usecases/list-category/list-category.usecase';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/collection.presenter';

export class CategoryPresenter {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  //converter o formato da data
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: CategoryOutput) {
    this.id = output.id;
    this.name = output.name;
    this.description = output.description;
    this.is_active = output.is_active;
    this.created_at = output.created_at;
  }
}

//CollectionPresenter realiza as transformacoes dos dados de saida
export class CategoryCollectionPresenter extends CollectionPresenter {
  data: CategoryPresenter[];

  constructor(output: ListCategoriesOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new CategoryPresenter(item));
  }
}
