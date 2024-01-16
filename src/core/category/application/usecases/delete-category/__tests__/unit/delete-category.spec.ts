import { NotFoundError } from "../../../../../../shared/domain/errors/not_found";
import { InvalidUuidError, Uuid } from "../../../../../../shared/domain/value_objects/uuid.vo";
import { Category } from "../../../../../domain/category.aggregat";
import { CategoryInMemoryRepository } from "../../../../../infra/db/in-memory/category-in-memory.repository";
import { DeleteCategoryUseCase } from "../../delete-category.usecase";


describe("DeleteCategoryUseCase Unit Tests", () => {
    let useCase: DeleteCategoryUseCase;
    let repository: CategoryInMemoryRepository;
  
    beforeEach(() => {
      repository = new CategoryInMemoryRepository();
      useCase = new DeleteCategoryUseCase(repository);
    });
  
    it("should throws error when entity not found", async () => {
      await expect(() =>
        useCase.execute({ id: "fake id"})
      ).rejects.toThrow(new InvalidUuidError());
    });
  
    it("should delete a category", async () => {
      const items = [new Category({ name: "test 1" })];
      repository.items = items;
      await useCase.execute({
        id: items[0].category_id.id,
      });
      expect(repository.items).toHaveLength(0);
    });
  });