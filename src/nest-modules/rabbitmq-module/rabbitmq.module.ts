import { RabbitMqMessageBroker } from '@core/shared/infra/message-broker/rabbitmq-message-broker';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqConsumeErrorFilter } from './rabbitmq-consume-error/rabbitmq-consume-error.filter';
/*
@Module({
  imports: [
    //cria instancia do amqpConnection com a conexao com rabbitMQ
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('RABBITMQ_URI') as string,
      }),
      inject: [ConfigService],
    }),
  ],
  //registrar message broker
  providers: [
    {
      provide: 'IMessageBroker',
      useFactory: (amqpConnection: AmqpConnection) => {
        return new RabbitMqMessageBroker(amqpConnection);
      },
      inject: [AmqpConnection],
    },
  ],
  exports: ['IMessageBroker'],
})
*/

export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        //cria instancia do amqpConnection com a conexao com rabbitMQ
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('RABBITMQ_URI') as string,
            // criar as exchanges que serao utilizadas, dlx.exchange é a exchange da deadletter queue
            //direct.delayed exchange para reinserir msgs que deu erro na fila apos certo tempo
            exchanges: [
              { name: 'dlx.exchange', type: 'topic' },
              {
                name: 'direct.delayed',
                type: 'x-delayed-message',
                options: {
                  arguments: {
                    'x-delayed-type': 'direct',
                  },
                },
              },
            ],
            //criar a fila que ira se conectar na exchange de erros, routingKey=# aceita qualquer um routing key
            queues: [
              {
                name: 'dlx.queue',
                exchange: 'dlx.exchange',
                routingKey: '#',
                createQueueIfNotExists: false, //evitar a criacao de uma fila aleatoria
              },
            ],
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [RabbitmqConsumeErrorFilter],
      global: true,
      exports: [RabbitMQModule], //deixar os servicos da lib acessiveis globalmente
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'IMessageBroker',
          useFactory: (amqpConnection: AmqpConnection) => {
            return new RabbitMqMessageBroker(amqpConnection);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['IMessageBroker'],
    };
  }
}
