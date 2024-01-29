import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

// nao iniciar o http, pois para os consumidores do rabbitmq nao precisa,
// inicializacao dos consumers é separado das rotas http
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  //inicia os consumidores de menssagem do rabbitmq
  await app.init();
}
bootstrap();
