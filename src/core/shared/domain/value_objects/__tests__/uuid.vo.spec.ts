import { InvalidUuidError, Uuid } from "../uuid.vo"

describe("Uuid unit tests", () => {
    const validateSpy = jest.spyOn(Uuid.prototype as any, "validate")

    test("should throw error when uuid is invalid", () => {
        expect(() => {
            new Uuid("invalid-uuid")
        }).toThrow(new InvalidUuidError())
    })

    test("should create a valid uuid", () => {
        const uuid = new Uuid()
        expect(uuid.id).toBeDefined()
        expect(validateSpy).toHaveBeenCalledTimes(1)
    })
   
})