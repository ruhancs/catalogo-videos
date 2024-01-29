import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WrapperDataInterceptor } from './shared-module/interceptors/wrapper-data/wrapper-data.interceptor';
import { EntityValidationErrorFilter } from './shared-module/filters/entity-validation-error.filter';
import { NotFoundErrorFilter } from './shared-module/filters/not-found-error.filter';

//criar applicacoes globais, para configurar os interceptors e filters no main e nos testes e2e
export function applyGlobalConfig(app: INestApplication) {
  //pipe para os dados recebidos de @Body
  app.useGlobalPipes(
    new ValidationPipe({
      //substituir erro 400 para 422, para melhorar semantica de erro
      errorHttpStatusCode: 422,
      // forca o casting dos tipos, transforma a string do tipo de cast-member em int para armazenar
      transform: true,
    }),
  );
  //useGlobalInterceptors funciona como um middleware entre um controller e a requisicao recebida e a resposta
  //realiza pre validacao nos dados recebidos, pode fazer alteracoes na resposta tambem
  app.useGlobalInterceptors(
    new WrapperDataInterceptor(), //modifica as saidas dos controller, adiciona data antes do body
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  //capturar erros de not found e erro de validacao de entidade, filtros globais
  app.useGlobalFilters(
    new EntityValidationErrorFilter(),
    new NotFoundErrorFilter(),
  );
}
