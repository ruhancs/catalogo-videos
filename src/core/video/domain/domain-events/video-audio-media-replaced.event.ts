import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { VideoId } from '../video.aggregate';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';

export type VideoAudioMediaReplacedProps = {
  aggregate_id: VideoId;
  media: Trailer | VideoMedia;
  media_type: 'trailer' | 'video';
};

export class VideoAudioMediaReplaced implements IDomainEvent {
  aggregate_id: VideoId;
  occurred_on: Date;
  event_version: number;

  readonly media: Trailer | VideoMedia;
  readonly media_type: 'trailer' | 'video';

  constructor(props: VideoAudioMediaReplacedProps) {
    this.aggregate_id = props.aggregate_id;
    this.occurred_on = new Date();
    this.event_version = 1;
    this.media = props.media;
    this.media_type = props.media_type;
  }

  getIntegrationEvent(): IIntegrationEvent<any> {
    return new VideoAudioMediaUploadedIntegrationEvent(this);
  }
}

//evento de integracao que sera ouvido por PublishVideoMediaReplacedInQueueHandler, e disparado por ApplicatioService
export class VideoAudioMediaUploadedIntegrationEvent
  implements IIntegrationEvent
{
  //declare indica que a variavel talvez nao exista
  //variaveis marcadas com declare, na hora da compilacao do typescript sao descartadas no js gerado
  declare event_version: number;
  declare payload: any;
  declare event_name: string;
  declare occurred_on: Date;
  constructor(event: VideoAudioMediaReplaced) {
    //this['resource_id'] inserir uma variavel que nao quer que apareca externamente
    this['resource_id'] = `${event.aggregate_id.id}.${event.media_type}`; //exemplo UUID.Trailer
    this['file_path'] = event.media.raw_url;
  }
}

/*
export class VideoAudioMediaUploadedIntegrationEvent
  implements IIntegrationEvent
{
  occurred_on: Date;
  event_version: number;
  payload: any;
  event_name: string;

  constructor(event: VideoAudioMediaReplaced) {
    this.event_version = event.event_version;
    this.occurred_on = event.occurred_on;
    this.payload = {
      video_id: event.aggregate_id,
      media: event.media.toJson(),
      //media_type: event.media_type,
    };
    this.event_name = this.constructor.name;
  }
}
*/
