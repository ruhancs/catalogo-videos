import { Uuid } from "../../../../../../shared/domain/value_objects/uuid.vo";
import { setupSequelize } from "../../../../../../shared/infra/testing/helpers";
import { CategoryModel } from "../../../../../infra/db/sequelize/category.model";
import { CategorySequelizeRepository } from "../../../../../infra/db/sequelize/category_sequelize.repository";
import { CreateCategoryUseCase } from "../../create-category.usecase";


describe("CreateCategoryUseCase Integration Tests", () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it("should create a category", async () => {
    let output = await useCase.execute({ name: "test" });
    let entity = await repository.findById(new Uuid(output.id));
    expect(output).toMatchObject({
      id: entity.category_id.id,
      name: "test",
      description: null,
      is_active: true,
    });

    output = await useCase.execute({
      name: "test",
      description: "some description",
    });
    entity = await repository.findById(new Uuid(output.id));
    expect(output).toMatchObject({
      id: entity.category_id.id,
      name: "test",
      description: "some description",
      is_active: true,
    });

    output = await useCase.execute({
      name: "test",
      description: "some description",
      is_active: true,
    });
    entity = await repository.findById(new Uuid(output.id));
    expect(output).toMatchObject({
      id: entity.category_id.id,
      name: "test",
      description: "some description",
      is_active: true,
    });

    output = await useCase.execute({
      name: "test",
      description: "some description",
      is_active: false,
    });
    entity = await repository.findById(new Uuid(output.id));
    expect(output).toMatchObject({
      id: entity.category_id.id,
      name: "test",
      description: "some description",
      is_active: false,
    });
  });
});