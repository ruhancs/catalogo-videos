import { ChannelWrapper } from 'amqp-connection-manager';
import { RabbitMqMessageBroker } from '../rabbitmq-message-broker';
import { IIntegrationEvent } from '../../../domain/events/domain-event.interface';
import { Uuid } from '../../../domain/value-objects/uuid.vo';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '../events-message-broker-config';

class TestEvent implements IIntegrationEvent {
  occurred_on: Date = new Date();
  event_version: number = 1;
  event_name: string = TestEvent.name;
  constructor(readonly payload: any) {}
}

describe('RabbitMQMessageBroker Unit tests', () => {
  let service: RabbitMqMessageBroker;
  let connection: ChannelWrapper; //mock de conexao com rabbitmq
  beforeEach(async () => {
    connection = {
      publish: jest.fn(),
    } as any;
    service = new RabbitMqMessageBroker(connection as any);
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid()); //criar evento

      await service.publishEvent(event); //simular publicacao do evento no rabbitmq

      //verificar se o evento foi chamado com a exchange e routing-key correta
      expect(connection.publish).toHaveBeenCalledWith(
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].exchange,
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].routing_key,
        event,
      );
    });
  });
});
