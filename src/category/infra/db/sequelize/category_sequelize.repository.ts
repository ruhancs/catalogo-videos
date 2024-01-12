import { Op } from "sequelize";
import { Entity } from "../../../../@shared/domain/entity";
import { NotFoundError } from "../../../../@shared/domain/errors/not_found";
import { SearchParams } from "../../../../@shared/domain/repository/search-params";
import { SearchResult } from "../../../../@shared/domain/repository/search-result";
import { Uuid } from "../../../../@shared/domain/value_objects/uuid.vo";
import { Category } from "../../../domain/category.entity";
import { CategorySearchParams, CategorySearchResult, ICategoryRepository } from "../../../domain/category_repository";
import { CategoryModel } from "./category.model";
import { CategoryModelMapper } from "./category-mapper";


export class CategorySequelizeRepository implements ICategoryRepository {
    sortableFields: string[] = ["name","created_at"];

    constructor(private categoryModel: typeof CategoryModel) {

    }

    async search(props: CategorySearchParams): Promise<CategorySearchResult> {
        const offset = (props.page - 1) * props.per_page
        const limit = props.per_page
        const {rows: models, count} = await this.categoryModel.findAndCountAll({... (props.filter && {
            where: {
                //filter
                name: {[Op.like]: `%${props.filter}%`}
            },
        }),
        //ordenacao
        ...(props.sort && this.sortableFields.includes(props.sort)) 
        ? {order: [[props.sort, props.sort_dir]]} 
        : {order: [["created_at", "desc"]]},
        offset,
        limit,
        })

        return new CategorySearchResult({
            items: models.map((model) => {
                return CategoryModelMapper.toEntity(model);
            }),
            current_page: props.page,
            per_page: props.per_page,
            total: count,
        })
    }

    async insert(entity: Category): Promise<void> {
        await this.categoryModel.create({
            category_id: entity.category_id.id,
            name: entity.name,
            description: entity.description,
            is_active: entity.is_active,
            created_at: entity.created_at,
        })
    }

    async bulkInsert(entities: Category[]): Promise<void> {
        const modelsProps = entities.map((entity) =>
        CategoryModelMapper.toModel(entity).toJSON()
      );
      await this.categoryModel.bulkCreate(modelsProps);
    }

    async update(entity: Category): Promise<void> {
        const model = await this._get(entity.category_id.id)

        if (!model) {
            throw new NotFoundError(entity.category_id.id, this.getEntity())
        }

        const modelProps = CategoryModelMapper.toModel(entity);
        await this.categoryModel.update(modelProps.toJSON(), {
          where: { category_id: entity.category_id.id },
        });
    }
    async delete(entity_id: Uuid): Promise<void> {
        const model = await this._get(entity_id.id)

        if (!model) {
            throw new NotFoundError(entity_id.id, this.getEntity())
        }

        await this.categoryModel.destroy({where: {category_id: entity_id.id}})
    }

    async findById(entity_id: Uuid): Promise<Category|null> {
        const model = await this._get(entity_id.id)

        if (!model) {
            return null
        }

        return new Category({
            category_id: new Uuid(model.category_id),
            name: model.name,
            description:model.description,
            is_active: model.is_active, 
            created_at: model.createdAt
        })
    }

    async findAll(): Promise<Category[]> {
        const models = await this.categoryModel.findAll()

        return models.map((model) => {
            return new Category({
                category_id: new Uuid(model.category_id),
                name: model.name,
                description: model.description,
                is_active: model.is_active,
                created_at: model.createdAt
            })
        })
    }
    getEntity(): new (...args: any[]) => Category {
        return Category
    }

    private async _get(id: string){
        const model = await this.categoryModel.findByPk(id)
        return model
    } 
    
}