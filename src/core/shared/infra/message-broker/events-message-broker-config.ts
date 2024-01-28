import { VideoAudioMediaUploadedIntegrationEvent } from '@core/video/domain/domain-events/video-audio-media-replaced.event';

//tipos de eventos que ocorrem na aplicacao, todos eventos sao registrados aqui
export const EVENTS_MESSAGE_BROKER_CONFIG = {
  //configuracoes de envio do evento para o rabbitmq
  [VideoAudioMediaUploadedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routing_key: VideoAudioMediaUploadedIntegrationEvent.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routing_key: 'TestEvent',
  },
};
