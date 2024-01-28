import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { ProcessAudioVideoMediasInput } from '@core/video/application/use-cases/proccess-audio-video-medias/proccess-audio-video-medias.input';
import { ProccessAudioVideoMediasUseCase } from '@core/video/application/use-cases/proccess-audio-video-medias/proccess-audio-video-medias.use-case';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, UseFilters, ValidationPipe } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { RabbitmqConsumeErrorFilter } from '../rabbitmq-module/rabbitmq-consume-error/rabbitmq-consume-error.filter';

//inicia consumindo a fila do rabbitmq, RabbitmqConsumeErrorFilter exportado em rabbitmq.module
@UseFilters(RabbitmqConsumeErrorFilter) //tratar erros de validacao de ProcessAudioVideoMediasInput
@Injectable()
export class VideosConsumers {
  constructor(
    //moduleRef tem acesso ao modulo corrente que esta sendo usado neste caso é o de video
    private moduleRef: ModuleRef,
  ) {}

  //recebe a msg do rabbitmq
  //se inscrever na fila do rabbitmq com a routing-key, cria fila e routing key se nao existir
  @RabbitSubscribe({
    exchange: 'direct.delayed', // exchange com delay de reprocessamento de msgs de erro
    routingKey: 'videos.convert',
    queue: 'micro-videos/admin',
    //permitir receber menssagens que nao sao json
    //tratamento de erros sera feito no software
    allowNonJsonMessages: true,
    //inserir dead letter exchange para enviar msg que deu erro no processamento do consumidor
    queueOptions: {
      deadLetterExchange: 'dlx.exchange',
      //publicada na dlx.exchange pela routing-key videos.convert
      deadLetterRoutingKey: 'videos.convert',
      //messageTtl: 5000, //tempo para reenviar a msg para a fila principal, 5 segundos
    },
  })
  async onProcessVideo(msg: {
    video: {
      resource_id: string;
      encoded_video_folder: string; //pasta que cotem o video fragmentado
      status: 'COMPLETED' | 'FAILED';
    };
  }) {
    //verificar se video existe na msg
    const resource_id = `${msg.video?.resource_id}`;
    //desmenbrar o caminho de resource que sera id-do-video.tipo-de-field
    const [video_id, field] = resource_id.split('.');

    const input = new ProcessAudioVideoMediasInput({
      video_id: video_id,
      field: field as 'trailer' | 'video',
      encoded_location: msg.video?.encoded_video_folder,
      status: msg.video?.status as AudioVideoMediaStatus,
    });

    //try { trycatch nao necessario erro esta sendo tratado pelo filter RabbitmqConsumeErrorFilter

    //processAudioVideoMediaUseCase é scope request, pois deepende um provider que é scope request (unit of work)
    //só é instanciado quando recebe uma requisicao
    //pegar ProccessAudioVideoMediasUseCase do modulo
    //resolve é utilizado para pegar servicos Scope.Request e Scope.Transient, os outros casos é utilizado get
    const usecase = await this.moduleRef.resolve(
      ProccessAudioVideoMediasUseCase,
    );
    //validar dados de input, que sao a msg recebida no rabbitmq
    await new ValidationPipe({
      errorHttpStatusCode: 422,
    }).transform(input, {
      metatype: ProcessAudioVideoMediasInput,
      type: 'body',
    });
    await usecase.execute(input);

    //} catch (error) {
    //  console.log(error);
    //}
  }
}
