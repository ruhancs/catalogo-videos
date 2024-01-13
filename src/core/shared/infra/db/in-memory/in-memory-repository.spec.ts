import { Entity } from "../../../domain/entity";
import { NotFoundError } from "../../../domain/errors/not_found";
import { ValueObject } from "../../../domain/value_object";
import { Uuid } from "../../../domain/value_objects/uuid.vo";
import { InMemoryRepository } from "./in-memory.repository";

type StubEntityProps = {
    entity_id?: Uuid
    name: string
    price: number
}

class StubEntity extends Entity {
    entity_id: Uuid
    name: string
    price: number

    constructor(props: StubEntityProps) {
        super()
        this.entity_id = props.entity_id || new Uuid()
        this.name = props.name
        this.price = props.price
    }

    toJSON() {
       return {
        entity_id: this.entity_id.id,
        name: this.name,
        price: this.price
       }
    }
    
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid>  {
    getEntity(): new (...args: any[]) => StubEntity {
        return StubEntity
    }
    
}

describe("InMemoryRepository Unit Test", () => {
    let repo: StubInMemoryRepository
    beforeEach(() => {
        repo = new StubInMemoryRepository()
    })

    it("should insert a new entity", async () => {
        const entity = new StubEntity({name: "E1", price: 10})
        await repo.insert(entity)

        expect(repo.items.length).toBe(1)
        expect(repo.items[0]).toBe(entity)
    })

    it("should bulk insert entities", async() => {
        const entity1 = new StubEntity({name: "E1", price: 10})
        const entity2 = new StubEntity({name: "E2", price: 20})

        await repo.bulkInsert([entity1,entity2])

        expect(repo.items.length).toBe(2)
    })

    it("should return all entities", async() => {
        const entity1 = new StubEntity({name: "E1", price: 10})
        const entity2 = new StubEntity({name: "E2", price: 20})

        await repo.bulkInsert([entity1,entity2])

        const entities = await repo.findAll()

        expect(entities.length).toBe(2)
    })

    it("should throw an error to update an entity not found", async() => {
        const id = new Uuid()
        const entity = new StubEntity({name: "E1", price: 10})
        
       await  expect(repo.update(entity)).rejects.toThrow(new NotFoundError(id, StubEntity))

    })

    it("should update an entity", async() => {
        const id = new Uuid()
        const entity = new StubEntity({name: "E1", price: 10})
        
        await repo.insert(entity)
        entity.name = "E2"
        entity.price = 15
        await repo.update(entity)

        expect(repo.items[0].name).toBe("E2")
        expect(repo.items[0].price).toBe(15)
    })

    it("should throw an error to delete an entity not found", async() => {
        const id = new Uuid()
        
       await  expect(repo.delete(id)).rejects.toThrow(new NotFoundError(id, StubEntity))

    })


})