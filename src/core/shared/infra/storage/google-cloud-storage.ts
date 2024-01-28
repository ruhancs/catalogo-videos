import { IStorage } from '@core/shared/application/storage.interface';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';

export class GoogleCloudStorage implements IStorage {
  constructor(
    private storageSdk: GoogleCloudStorageSdk,
    private bucketName: string,
  ) {}

  store(object: {
    data: Buffer;
    mime_type?: string | undefined;
    id: string;
  }): Promise<void> {
    //pegar instancia da bucket
    const bucket = this.storageSdk.bucket(this.bucketName);
    //criar o arquivo que sera armazenado,nome do arquivo sera o id do arquivo de upload
    const file = bucket.file(object.id);
    //salvar o arquivo recebido no upload na bucket, retorna uma Promise<void>
    return file.save(object.data, {
      metadata: { contentType: object.mime_type },
    });
  }
  async get(
    id: string,
  ): Promise<{ data: Buffer; mime_type: string | undefined }> {
    //pegar instancia da bucket que se quer pegar o arquivo, e o id(nome) do file que se quer pegar
    const file = this.storageSdk.bucket(this.bucketName).file(id);
    //baixar o arquivo e os metadados
    const [metadata, content] = await Promise.all([
      file.getMetadata(), //promise que retorna os metadados que sera armazenado em metadata
      file.download(), //promise que retorna o arquivo que sera armazenado em content
    ]);
    return { data: content[0], mime_type: metadata[0].contentType };
  }
}
