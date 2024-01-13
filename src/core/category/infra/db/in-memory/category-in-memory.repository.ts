import { SortDirection } from "../../../../shared/domain/repository/search-params";
import { Uuid } from "../../../../shared/domain/value_objects/uuid.vo";
import { InMemoryRepository, InMemorySearchableRepository } from "../../../../shared/infra/db/in-memory/in-memory.repository";
import { Category } from "../../../domain/category.entity";
import { CategoryFilter, ICategoryRepository } from "../../../domain/category_repository";

export class CategoryInMemoryRepository extends InMemorySearchableRepository<Category,Uuid> implements ICategoryRepository {
    sortableFields: string[] = ["name", "created_at"];
    protected async applyFilter(items: Category[], filter: CategoryFilter): Promise<Category[]> {
        if (!filter) {
            return items;
        }
      
        return items.filter((i) => {
            return (
                i.name.toLowerCase().includes(filter.toLowerCase()));
        });
    }

    getEntity(): new (...args: any[]) => Category {
        throw Category
    }
    protected applySort(
        items: Category[], 
        sort: string, 
        sort_dir: SortDirection, 
        custom_getter?: (sort: string, item: Category) => any): Category[] {
        return sort 
            ? super.applySort(items, sort, sort_dir) 
            : super.applySort(items, "created_at", "desc") //se nao for aplicado sort ordena por ordem decrescente de criacao
    }
}