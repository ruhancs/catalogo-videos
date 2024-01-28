import { NotFoundError } from '@core/shared/domain/errors/not_found';
import { EntityValidationError } from '@core/shared/domain/validators/validation_error';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConsumeMessage, MessagePropertyHeaders } from 'amqplib';

//pegar os erros de video.consumer, erros do ValidationPipe de ProcessAudioVideoMediasInput
@Catch()
export class RabbitmqConsumeErrorFilter implements ExceptionFilter {
  static readonly RETRY_COUNT_HEADER = 'x-retry-count';
  static readonly MAX_RETRIES = 3;
  //erros que nao devem ser feitas novas tentativas de processamento
  static readonly NON_RETRIABLE_ERRORS = [
    NotFoundError, //se o video nao for encontrado
    EntityValidationError, //erro de dominio, dados de entrada invalidos
    UnprocessableEntityException, // nome da exception retornada pelo rabbitmq
  ];

  constructor(private amqpConnection: AmqpConnection) {}

  async catch(exception: Error, host: ArgumentsHost) {
    // host.getType<'rmq'>() pega o tipo do contexto, no caso conexao rmq
    //se o erro nao for causado por comunicacao com rabbitmq
    if (host.getType<'rmq'>() !== 'rmq') {
      return;
    }

    //verificar se a exception do filtro é instancia de algum dos erros de NON_RETRIABLE_ERRORS
    const hasRetriableError =
      RabbitmqConsumeErrorFilter.NON_RETRIABLE_ERRORS.some(
        (error) => exception instanceof error,
      );

    //se tiver um erro nao reprocessavel, rejeita o reprocessamento na fila
    if (hasRetriableError) {
      return new Nack(false); //requeue false, envia para dead letter
    }

    //contexto da requisicao do rabbitmq
    const ctx = host.switchToRpc();
    const message: ConsumeMessage = ctx.getContext(); //capturar a message do rabbitmq
    if (this.shouldRetry(message.properties.headers)) {
      //envia para fila de retentativa
      await this.retry(message);
    } else {
      //numero de retentaivas excedido, envia a msg para dead letter queue
      return new Nack(false); //requeue false, envia para dead letter
    }
  }

  //metodo paradefinir se o retry deve ser feito
  private shouldRetry(messageHeaders: MessagePropertyHeaders): boolean {
    //header criado quando uma retentativa de retry for feita x-retry-count
    const retryHeader = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;
    const maxRetries = RabbitmqConsumeErrorFilter.MAX_RETRIES;

    //messageHeaders contem os headers da msg do rabbittmq, verificar se retryHeader existe
    //x-retry-count criado no header para contagem de retentativas
    //se o retryHeader nao existir retorna que pode ser reprocessado,
    //e se o numero de tentativas for menor que maxRetries pode ser feito nova tentaiva
    return (
      !(retryHeader in messageHeaders) ||
      messageHeaders[retryHeader] < maxRetries
    );
  }

  private async retry(message: ConsumeMessage) {
    const messageHeaders = message.properties.headers;
    const retryHeader = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;
    //adicionar valor na contagem ao header de retry da message
    messageHeaders[retryHeader] = messageHeaders[retryHeader]
      ? messageHeaders[retryHeader] + 1
      : 1;

    //delay de 5s para reenviar a menssagem
    messageHeaders['x-delay'] = 5000;
    //enviar a menssagem para a exchange que possui delay
    return this.amqpConnection.publish(
      'direct.delayed',
      message.fields.routingKey,
      message.content,
      {
        correlationId: message.properties.correlationId,
        headers: messageHeaders,
      },
    );
  }
}
