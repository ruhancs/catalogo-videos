import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../../aggregate-root';
import { Uuid } from '../../value-objects/uuid.vo';
import { ValueObject } from '../../value_object';
import { DomainEventMediator } from '../domain-event-mediator';
import { IDomainEvent, IIntegrationEvent } from '../domain-event.interface';

class StubEvent implements IDomainEvent {
  aggregate_id: ValueObject;
  occurred_on: Date;
  event_version: number;
  constructor(
    aggregate_id: Uuid,
    public name: string,
  ) {
    this.occurred_on = new Date();
    this.event_version = 1;
  }

  getIntegrationEvent(): StubIntegrationEvent {
    return new StubIntegrationEvent(this);
  }
}

class StubIntegrationEvent implements IIntegrationEvent {
  aggregate_id: ValueObject;
  occurred_on: Date;
  event_version: number;
  payload: any;
  event_name: string;
  constructor(event: StubEvent) {
    this.occurred_on = new Date();
    this.event_version = 1;
    this.payload = event;
    this.event_name = this.constructor.name;
  }
}

class StubAggregate extends AggregateRoot {
  id: Uuid;
  name: string;

  get entity_id(): ValueObject {
    return this.id;
  }
  action(name: string) {
    this.name = name;
    this.applyEvent(new StubEvent(this.id, this.name));
  }
  toJSON() {
    return {
      id: this.id.id,
      name: this.name,
    };
  }
}

describe('DomainEventMediator', () => {
  let mediator: DomainEventMediator;

  beforeEach(() => {
    const eventEmitter = new EventEmitter2();
    mediator = new DomainEventMediator(eventEmitter);
  });

  it('should publish handlers', async () => {
    expect.assertions(1);
    //registra o listener para escutar os eventos do agregado
    //ouvinte dos eventos da classe StubEvent, se registra para escutar o StubEvent
    mediator.register(StubEvent.name, async (event: StubEvent) => {
      expect(event.name).toBe('test');
    });

    //agregado que ira dispara o evento
    const aggregate = new StubAggregate();
    //executa a funcao action que possui um evento sendo disparado, dispara StubEvent
    aggregate.action('test');
    //publica os eventos do agregado
    await mediator.publish(aggregate);
  });

  it('should publish integration event', async () => {
    expect.assertions(3);
    //se rigistrar para capturar o evento de integracao que é disparado abaixo
    mediator.register(
      StubIntegrationEvent.name,
      async (event: StubIntegrationEvent) => {
        expect(event.event_name).toBe(StubIntegrationEvent.name);
        expect(event.event_version).toBe(1);
        expect(event.payload.name).toBe('test');
      },
    );

    const aggregate = new StubAggregate();
    aggregate.action('test');
    await mediator.publishIntegrationEvents(aggregate);
  });
});
