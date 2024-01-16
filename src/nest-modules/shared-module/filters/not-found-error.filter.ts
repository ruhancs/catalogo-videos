import { Response } from 'express';
import { NotFoundError } from '../../../core/shared/domain/errors/not_found';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

//captura uma excecao, catch é colocado o erro para se capturar
//captura o NotFoundError criado no core
//declarar o filtro globalmente no main
@Catch(NotFoundError)
export class NotFoundErrorFilter implements ExceptionFilter {
  //ArgumentsHost = informacoes de onde o erro foi lancado
  catch(exception: NotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    response.status(404).json({
      statusCode: 404,
      error: 'Not Found',
      message: exception.message,
    });
  }
}
