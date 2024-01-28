import { ValueObject } from '../value_object';

//Eventos internos do dominio, evento de dominio possui relacao de 1 para 1 com evento de integracao
export interface IDomainEvent {
  aggregate_id: ValueObject;
  occurred_on: Date;
  event_version: number;

  //metodo opcional para IDomainEvent, pois nem todo evento de dominio tera um evento de integracao
  getIntegrationEvent?(): IIntegrationEvent;
}

//Eventos que se comunicarao com outros subdominios, ex evento que ira para o rabbitmq
export interface IIntegrationEvent<T = any> {
  occurred_on: Date;
  event_version: number;
  payload: T;
  event_name: string;
}
