import { ValueObject } from "./value_object";


export abstract class Entity{
    abstract get entity_id(): ValueObject
    abstract toJSON(): any
} 