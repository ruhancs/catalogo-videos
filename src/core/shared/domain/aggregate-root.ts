import { Entity } from './entity';

//utilizado para descrever os aggregados, separar de entidades
//agregado lida com eventos de dominio, algo que a entidade nao lida
export abstract class AggregateRoot extends Entity {}
