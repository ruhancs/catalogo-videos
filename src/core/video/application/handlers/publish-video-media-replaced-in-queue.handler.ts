import { IIntegrationEventHandler } from '@core/shared/application/domain-event-handler.interface';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { VideoAudioMediaUploadedIntegrationEvent } from '@core/video/domain/domain-events/video-audio-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';

//ouvinte de evento de integracao
export class PublishVideoMediaReplacedInQueueHandler
  implements IIntegrationEventHandler
{
  constructor(private messageBroker: IMessageBroker) {
    // console.log(messageBroker);
  }
  // VideoAudioMediaUploadedIntegrationEvent é o tipo do evento que sera recebido
  // VideoAudioMediaUploadedIntegrationEvent é o evento que é disparado pelo agregado de video que é registrado no uou
  // e disparado pelo usecase UploadAudioVideoMediasUseCase em video.replaceVideo
  // appservice.run gerencia uow que rastreia os eventos e dispara
  @OnEvent(VideoAudioMediaUploadedIntegrationEvent.name) // acoplamento ao nest no core nao é o ideal
  async handle(event: VideoAudioMediaUploadedIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }
}
