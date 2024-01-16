import { Module } from '@nestjs/common';
import { ConfigModule } from '../config-module/config.module';
import { DatabaseModule } from './database.module';

//module de configuracoes das migracoes, inicia o db para realizar as migracoes
//utiliza este modulo em migrate.ts, para realizar as migracoes
@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
})
export class MigrationsModule {}
