import { AggregateRoot } from '../aggregate-root';
import { IDomainEvent } from '../events/domain-event.interface';
import { Uuid } from '../value-objects/uuid.vo';
import { ValueObject } from '../value_object';

class StubEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number = 1;

  constructor(
    public aggregate_id: Uuid,
    public name: string,
  ) {
    this.occurred_on = new Date();
    this.name;
  }
}

class StubAggregateRoot extends AggregateRoot {
  aggregate_id: Uuid;
  name: string;
  field1: string;
  constructor(name: string, id: Uuid) {
    super();
    this.aggregate_id = id;
    this.name = name;
    //registra o evento e a funcao que sera disparada no evento
    this.registerHandler(StubEvent.name, this.onStubEvent.bind(this));
  }

  //quando acontecer operation for chamado o onStubEvent é executado automaticamente
  //evento é StubEvent.name e o handler é this.onStubEvent.bind(this) registrados no construtor
  operation() {
    this.name = this.name.toLocaleUpperCase();
    this.applyEvent(new StubEvent(this.aggregate_id, this.name));
  }

  onStubEvent(event: StubEvent) {
    this.field1 = event.name;
  }

  get entity_id(): ValueObject {
    throw new Error('Method not implemented.');
  }
  toJSON() {
    throw new Error('Method not implemented.');
  }
}

describe('AggregateRoot Unit Tests', () => {
  test('dispatch events', () => {
    const id = new Uuid();
    const aggregate = new StubAggregateRoot('name', id);
    aggregate.operation();
    expect(aggregate.field1).toBe('NAME');
  });
});
