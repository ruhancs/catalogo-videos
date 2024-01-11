import { ValueObject } from "../value_object";

class StringValueObj extends ValueObject {
    constructor(readonly value: string) {
        super()
    }
}

class ComplexValueObj extends ValueObject {
    constructor(readonly prop1: string, readonly prop2: number) {
        super()
    }
}

describe("ValueObject unit tests", () => {
    test("should be equal", () => {
        const valueObject1 = new StringValueObj("test") 
        const valueObject2 = new StringValueObj("test")
        expect(valueObject1.equals(valueObject2)).toBeTruthy() 
        
        const complexObjValue1 = new ComplexValueObj("test1", 1)
        const complexObjValue2 = new ComplexValueObj("test1", 1)
        expect(complexObjValue1.equals(complexObjValue2)).toBeTruthy() 
    })
    
    test("should not be equal", () => {
        const valueObject1 = new StringValueObj("test1") 
        const valueObject2 = new StringValueObj("test")
        expect(valueObject1.equals(valueObject2)).toBeFalsy() 
        
        const complexObjValue1 = new ComplexValueObj("test1", 1)
        const complexObjValue2 = new ComplexValueObj("test1", 2)
        expect(complexObjValue1.equals(complexObjValue2)).toBeFalsy() 
    })
})