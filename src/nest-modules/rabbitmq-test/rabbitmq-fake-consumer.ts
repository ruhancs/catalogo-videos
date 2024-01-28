import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMqFakeConsumer {
  //se queue e routingKey nao existir ele cria automaticamente
  @RabbitSubscribe({
    exchange: 'amq.direct',
    queue: 'fake-queue',
    routingKey: 'fake-key',
  })
  handle(msg) {
    console.log(msg);
  }
}
