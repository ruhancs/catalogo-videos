import { Config } from '../../config';
import { GoogleCloudStorage } from '../google-cloud-storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
describe('GoogleCloudStorage Unit Tests', () => {
  let googleCloudStorage: GoogleCloudStorage;
  let storageSdk: GoogleCloudStorageSdk;

  beforeEach(() => {
    storageSdk = new GoogleCloudStorageSdk({
      credentials: Config.googleCredentials(), //json com credenciais do gcp
    });
    const bucketName = Config.bucketName();
    googleCloudStorage = new GoogleCloudStorage(storageSdk, bucketName);
  });

  it('should store a file', async () => {
    const saveMock = jest.fn().mockImplementation(undefined);
    //mock do metodo file.save de gooogle-storage.ts
    const fileMock = jest.fn().mockImplementation(() => ({
      save: saveMock,
    }));
    //mock do metodo bucket.file que cria o file que sera armazena um arquivo
    jest.spyOn(storageSdk, 'bucket').mockImplementation(
      () =>
        ({
          file: fileMock,
        }) as any,
    );
    await googleCloudStorage.store({
      data: Buffer.from('data'),
      id: 'location/1.txt',
      mime_type: 'text/plain',
    });

    expect(storageSdk.bucket).toHaveBeenCalledWith(Config.bucketName());
    expect(fileMock).toHaveBeenCalledWith('location/1.txt');
    expect(saveMock).toHaveBeenCalledWith(Buffer.from('data'), {
      metadata: {
        contentType: 'text/plain',
      },
    });
  });

  it('should get a file', async () => {
    const getMetadataMock = jest.fn().mockResolvedValue(
      Promise.resolve([
        {
          contentType: 'text/plain',
          name: 'location/1.txt',
        },
      ]),
    );
    //mock do metodo file.getMetadata e file.download
    const downloadMock = jest
      .fn()
      .mockResolvedValue(Promise.resolve([Buffer.from('data')]));
    const fileMock = jest.fn().mockImplementation(() => ({
      getMetadata: getMetadataMock,
      download: downloadMock,
    }));
    jest.spyOn(storageSdk, 'bucket').mockImplementation(
      () =>
        ({
          file: fileMock,
        }) as any,
    );

    const result = await googleCloudStorage.get('location/1.txt');
    expect(storageSdk.bucket).toHaveBeenCalledWith(Config.bucketName());
    expect(fileMock).toHaveBeenCalledWith('location/1.txt');
    expect(getMetadataMock).toHaveBeenCalledWith();
    expect(downloadMock).toHaveBeenCalledWith();
    expect(result).toEqual({
      data: Buffer.from('data'),
      mime_type: 'text/plain',
    });
  });
});
