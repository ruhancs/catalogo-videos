import { ValueObject } from "./value_object";
import { Notification } from "./validators/notification";

export abstract class Entity{
    notification: Notification = new Notification();
    abstract get entity_id(): ValueObject
    abstract toJSON(): any
} 