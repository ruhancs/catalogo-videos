import { MaxLength } from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-field';
import { Notification } from '../../shared/domain/validators/notification';
import { Video } from './video.aggregate';

class VideoRules {
  //habilitar decorators em tsconfig.json, "experimentalDecorators": true, "emitDecoratorMetadata": true,
  //desabilitar a checagem de null no tsconfig.json, "strictNullChecks": false,
  //habilitar decoretors no .swcrc "legacyDecorator": true, "decoratorsMetadata": true
  @MaxLength(255, { groups: ['title'] }) //validaçao do dominio, groups: ['name'] validacao por grupos do class validator
  title: string;

  constructor(entity: Video) {
    Object.assign(this, entity); //copia as propiedades para a entity
  }
}

export class VideoValidator extends ClassValidatorFields {
  //notification= instancia de Notification, data= dados a serem validados, fields= campos que devem ser validados
  //se nao for informados fields, ira validar todos campos
  //quais campos se quer validar
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['title'];
    return super.validate(notification, new VideoRules(data), newFields);
  }
}

export class VideoValidatorFactory {
  static create() {
    return new VideoValidator();
  }
}
