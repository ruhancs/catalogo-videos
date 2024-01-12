import { CategoryInMemoryRepository } from "../../../../infra/db/in-memory/category-in-memory.repository";
import { CreateCategoryUseCase } from "../../create-category.usecase";

describe('CreateCategoryUseCase Unit Tests', () => {
    let useCase: CreateCategoryUseCase;
    let repository: CategoryInMemoryRepository;
  
    beforeEach(() => {
      repository = new CategoryInMemoryRepository();
      useCase = new CreateCategoryUseCase(repository);
    });
  
    it('should create a category', async () => {
      const spyInsert = jest.spyOn(repository, 'insert');
      let output = await useCase.execute({ name: 'test' });
      expect(spyInsert).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: repository.items[0].category_id.id,
        name: 'test',
        description: null,
        is_active: true,
      });
  
      output = await useCase.execute({
        name: 'test',
        description: 'some description',
        is_active: false,
      });
      expect(spyInsert).toHaveBeenCalledTimes(2);
      expect(output).toMatchObject({
        id: repository.items[1].category_id.id,
        name: 'test',
        description: 'some description',
        is_active: false,
      });
    });
  });