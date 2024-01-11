import { Uuid } from "../../../@shared/domain/value_objects/uuid.vo"
import { Category } from "../category.entity"

describe("Category Unit Tests", () => {
    let validateSpy: any
    beforeEach(() => {
        //resetar o validate antes de cada teste
        validateSpy = jest.spyOn(Category, "validate")
    })
    describe("constructor", () => {
        test("should create category with default values", () => {
            const category = new Category({
                name: "Movie"
            })
            expect(category.category_id).toBeInstanceOf(Uuid)
            expect(category.name).toBe("Movie")
            expect(category.description).toBeNull()
            expect(category.is_active).toBeTruthy()
            expect(category.created_at).toBeInstanceOf(Date)
        })
        
        test("should create category with all values", () => {
            const createdAT = new Date()
            const category = new Category({
                name: "Movie",
                description: "Movie description",
                is_active: false,
                created_at: createdAT
            })
            expect(category.category_id).toBeInstanceOf(Uuid)
            expect(category.name).toBe("Movie")
            expect(category.description).toBe("Movie description")
            expect(category.is_active).toBeFalsy()
            expect(category.created_at).toBe(createdAT)
        })
    })

    describe("Command create", () => {
        test("should create category with default values", () => {
            const category = Category.create({name: "Movie"})
            expect(category.category_id).toBeInstanceOf(Uuid)
            expect(category.name).toBe("Movie")
            expect(category.description).toBeNull()
            expect(category.is_active).toBeTruthy()
            expect(category.created_at).toBeInstanceOf(Date)
        })
        test("should create category with all values", () => {
            const category = Category.create({
                name: "Movie",
                description: "Movie description",
                is_active: false,
            })
            expect(category.category_id).toBeInstanceOf(Uuid)
            expect(category.name).toBe("Movie")
            expect(category.description).toBe("Movie description")
            expect(category.is_active).toBeFalsy()
            expect(category.created_at).toBeInstanceOf(Date)
            expect(validateSpy).toHaveBeenCalledTimes(1)
        })
    })
    
    describe("Category Methods", () => {
        test("changeName method", () => {
            const createdAT = new Date()
            const category = new Category({
                name: "Movie",
                description: "Movie description",
                is_active: false,
                created_at: createdAT
            })
            category.changeName("Movie2")
            expect(category.category_id).toBeInstanceOf(Uuid)
            expect(category.name).toBe("Movie2")
            expect(category.description).toBe("Movie description")
            expect(category.is_active).toBeFalsy()
            expect(category.created_at).toBe(createdAT)
            expect(validateSpy).toHaveBeenCalledTimes(1)
        })
        
        test("changeDescription method", () => {
            const createdAT = new Date()
            const category = new Category({
                name: "Movie",
                description: "Movie description",
                is_active: false,
                created_at: createdAT
            })
            category.changeDescription("Movie Updated")
            expect(category.category_id).toBeInstanceOf(Uuid)
            expect(category.name).toBe("Movie")
            expect(category.description).toBe("Movie Updated")
            expect(category.is_active).toBeFalsy()
            expect(category.created_at).toBe(createdAT)
            expect(validateSpy).toHaveBeenCalledTimes(1)
        })
        
        test("activate method", () => {
            const createdAT = new Date()
            const category = new Category({
                name: "Movie",
                description: "Movie description",
                is_active: false,
                created_at: createdAT
            })
            category.activate()
            expect(category.category_id).toBeInstanceOf(Uuid)
            expect(category.name).toBe("Movie")
            expect(category.description).toBe("Movie description")
            expect(category.is_active).toBeTruthy()
            expect(category.created_at).toBe(createdAT)
            expect(validateSpy).toHaveBeenCalledTimes(1)
        })
       
        test("activate method", () => {
            const createdAT = new Date()
            const category = new Category({
                name: "Movie",
                description: "Movie description",
                is_active: true,
                created_at: createdAT
            })
            category.deactivate()
            expect(category.category_id).toBeInstanceOf(Uuid)
            expect(category.name).toBe("Movie")
            expect(category.description).toBe("Movie description")
            expect(category.is_active).toBeFalsy()
            expect(category.created_at).toBe(createdAT)
            expect(validateSpy).toHaveBeenCalledTimes(1)
        })
    })
})

describe("Category Validator", () => {
    describe("create command", () => {
        test("inavalid category name", () => {
            expect(() => Category.create({name: null})).containsErrorMessages({
                name: [
                    "name should not be empty",
                    "name must be a string",
                    "name must be shorter than or equal to 255 characters"
                ]
            })
            expect(() => Category.create({name: "t".repeat(256)})).containsErrorMessages({
                name: [
                    "name must be shorter than or equal to 255 characters"
                ]
            })
        })
    })
})