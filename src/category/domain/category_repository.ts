import { IRepository, ISearchableRepository } from "../../@shared/domain/repository/repository_interface";
import { SearchParams } from "../../@shared/domain/repository/search-params";
import { SearchResult } from "../../@shared/domain/repository/search-result";
import { Uuid } from "../../@shared/domain/value_objects/uuid.vo";
import { Category } from "./category.entity";

export type CategoryFilter = string

export class CategorySeaarchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category>{}

export interface ICategoryRepository extends ISearchableRepository<
    Category,
    Uuid, 
    CategoryFilter, 
    CategorySeaarchParams, 
    CategorySearchResult
> {}