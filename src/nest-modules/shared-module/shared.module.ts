import { GoogleCloudStorage } from '@core/shared/infra/storage/google-cloud-storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

//acesso global em toda aplicacao
@Global()
@Module({
  providers: [
    //registro do IStorage, para injetar no provider de video
    {
      provide: 'IStorage',
      //configService para acessar variaveis de ambiente
      useFactory: (configService) => {
        //variaveis de ambiente configuradas no config.module
        const credentials = configService.get('GOOGLE_CLOUD_CREDENTIALS');
        const bucket = configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
        const storage = new GoogleCloudStorageSdk({
          credentials,
        });
        //criar a instancia do storage
        return new GoogleCloudStorage(storage, bucket);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['IStorage'],
})
export class SharedModule {}
