import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { IIntegrationEvent } from '@core/shared/domain/events/domain-event.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EVENTS_MESSAGE_BROKER_CONFIG } from './events-message-broker-config';

export class RabbitMqMessageBroker implements IMessageBroker {
  constructor(private conn: AmqpConnection) {}
  async publishEvent(event: IIntegrationEvent): Promise<void> {
    //pegar as configuracoes do evento, armazenadas em EVENTS_MESSAGE_BROKER_CONFIG
    const config = EVENTS_MESSAGE_BROKER_CONFIG[event.constructor.name];
    // informar exchange, routing-key e o evnto, publica np rabbitmq
    await this.conn.publish(config.exchange, config.routing_key, event);
  }
}
