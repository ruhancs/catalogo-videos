import { Op, literal } from 'sequelize';
import { NotFoundError } from '../../../../shared/domain/errors/not_found';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { Category, CategoryId } from '../../../domain/category.aggregat';
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../domain/category_repository';
import { CategoryModel } from './category.model';
import { CategoryModelMapper } from './category-mapper';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      //iteral(`binary name ${sort_dir}` = expressao que sera passada para o banco de dados
      //para utilizar o order_by do mysql trabalha por padrao de binario para ascii
      //muda a comparacao das letras maiusculas e minusculas
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`), //ascii
    },
  };

  constructor(private categoryModel: typeof CategoryModel) {}

  //mysql lida com a ordenacao diferente do sqlite
  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: {
          //filter
          name: { [Op.like]: `%${props.filter}%` },
        },
      }),
      //ordenacao
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir!) }
        : { order: [['created_at', 'desc']] }),
      //? { order: [[props.sort, props.sort_dir]] }
      offset,
      limit,
    });

    return new CategorySearchResult({
      items: models.map((model) => {
        return CategoryModelMapper.toEntity(model);
      }),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  async insert(entity: Category): Promise<void> {
    await this.categoryModel.create({
      category_id: entity.category_id.id,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const modelsProps = entities.map((entity) =>
      CategoryModelMapper.toModel(entity).toJSON(),
    );
    await this.categoryModel.bulkCreate(modelsProps);
  }

  async update(entity: Category): Promise<void> {
    const model = await this._get(entity.category_id.id);

    if (!model) {
      throw new NotFoundError(entity.category_id.id, this.getEntity());
    }

    const modelProps = CategoryModelMapper.toModel(entity);
    await this.categoryModel.update(modelProps.toJSON(), {
      where: { category_id: entity.category_id.id },
    });
  }
  async delete(entity_id: Uuid): Promise<void> {
    const model = await this._get(entity_id.id);

    if (!model) {
      throw new NotFoundError(entity_id.id, this.getEntity());
    }

    await this.categoryModel.destroy({ where: { category_id: entity_id.id } });
  }

  async findById(entity_id: Uuid): Promise<Category | null> {
    const model = await this._get(entity_id.id);

    if (!model) {
      return null;
    }

    return new Category({
      category_id: new Uuid(model.category_id),
      name: model.name,
      description: model.description,
      is_active: model.is_active,
      created_at: model.createdAt,
    });
  }

  async findByIds(ids: CategoryId[]): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((m) => CategoryModelMapper.toEntity(m));
  }

  async existsById(
    ids: CategoryId[],
  ): Promise<{ exists: CategoryId[]; not_exists: CategoryId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsCategoryModels = await this.categoryModel.findAll({
      attributes: ['category_id'],
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsCategoryIds = existsCategoryModels.map(
      (m) => new CategoryId(m.category_id),
    );
    const notExistsCategoryIds = ids.filter(
      (id) => !existsCategoryIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCategoryIds,
      not_exists: notExistsCategoryIds,
    };
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();

    return models.map((model) => {
      return new Category({
        category_id: new Uuid(model.category_id),
        name: model.name,
        description: model.description,
        is_active: model.is_active,
        created_at: model.createdAt,
      });
    });
  }
  getEntity(): new (...args: any[]) => Category {
    return Category;
  }

  //definir a ordenacao conforme o db
  private formatSort(sort: string, sort_dir: SortDirection) {
    //verificar o banco de dados que esta sendo usado
    const dialect = this.categoryModel.sequelize!.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  private async _get(id: string) {
    const model = await this.categoryModel.findByPk(id);
    return model;
  }
}
