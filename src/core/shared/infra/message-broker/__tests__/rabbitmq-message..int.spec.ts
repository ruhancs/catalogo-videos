import { RabbitMqMessageBroker } from '../rabbitmq-message-broker';
import { IIntegrationEvent } from '../../../domain/events/domain-event.interface';
import { Uuid } from '../../../domain/value-objects/uuid.vo';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '../events-message-broker-config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Config } from '../../config';
import { ConsumeMessage } from 'amqplib';

class TestEvent implements IIntegrationEvent {
  occurred_on: Date = new Date();
  event_version: number = 1;
  event_name: string = TestEvent.name;
  constructor(readonly payload: any) {}
}

describe('RabbitMQMessageBroker Integration tests', () => {
  let service: RabbitMqMessageBroker;
  let connection: AmqpConnection;
  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitMqUri(),
      connectionInitOptions: { wait: true },
      //disabilitar logger da lib AmqpConnection
      logger: {
        debug: () => {},
        error: () => {},
        info: () => {},
        warn: () => {},
        log: () => {},
      } as any,
    });
    //se conectar imediatamente ao rabbitmq
    await connection.init();
    //criar canal padrao
    const channel = connection.channel;
    //configuracao da exchange, que sera destruida apos finalizacao do rabbitmq
    await channel.assertExchange('test-exchange', 'direct', {
      durable: false,
    });
    //configuracao da fila
    await channel.assertQueue('test-queue', { durable: false });
    //limpar sempre a fila
    await channel.purgeQueue('test-queue');
    //bind da fila com exchange com o TestEvent registrado em EVENTS_MESSAGE_BROKER_CONFIG
    await channel.bindQueue('test-queue', 'test-exchange', 'TestEvent');
    service = new RabbitMqMessageBroker(connection as any);
  });

  afterEach(async () => {
    //fechar conexao com rabbitmq
    try {
      await connection.managedConnection.close();
    } catch (error) {}
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid()); //criar evento

      await service.publishEvent(event); //publica o evento no rabbitmq

      //transformar em uma promise
      const msg: ConsumeMessage = await new Promise((resolve) => {
        //consumir a o evento
        connection.channel.consume('test-queue', (msg) => {
          resolve(msg); //termina a promise
        });
      });

      const msgObj = JSON.parse(msg.content.toString());
      expect(msgObj).toEqual({
        event_name: TestEvent.name,
        event_version: 1,
        occured_on: event.occurred_on.toISOString(),
        payload: event.payload,
      });

      //verificar se o evento foi chamado com a exchange e routing-key correta
      expect(connection.publish).toHaveBeenCalledWith(
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].exchange,
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].routing_key,
        event,
      );
    });
  });
});
