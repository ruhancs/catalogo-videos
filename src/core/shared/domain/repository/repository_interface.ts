import { Entity } from "../entity"
import { ValueObject } from "../value_object"
import { SearchParams } from "./search-params"
import { SearchResult } from "./search-result"

export interface IRepository<E extends Entity, EntityID extends ValueObject> {
    insert(entity: E): Promise<void>
    bulkInsert(entities: E[]): Promise<void>
    update(entity: E): Promise<void>
    delete(entity_id: EntityID): Promise<void>

    findById(entity_id: EntityID): Promise<E | null>
    findAll(): Promise<E[]>

    getEntity(): new (...args: any[]) => E
}

export interface ISearchableRepository<
E extends Entity, 
EntityID extends ValueObject,
Filter = string,
SearchInput = SearchParams<Filter>,
SearchOutput = SearchResult 
> extends IRepository<E, EntityID> {
    sortableFields: string[]
    search(props: SearchInput): Promise<SearchOutput>
}