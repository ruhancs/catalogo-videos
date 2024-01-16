import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyGlobalConfig } from './nest-modules/global-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //adicina filters,pipes, e interceptors
  await app.listen(3000);
  applyGlobalConfig(app);
}
bootstrap();
