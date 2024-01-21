import { MaxLength } from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-field';
import { Notification } from '../../shared/domain/validators/notification';
import { Genre } from './genre.aggregate';

class GenreRules {
  //habilitar decorators em tsconfig.json, "experimentalDecorators": true, "emitDecoratorMetadata": true,
  //desabilitar a checagem de null no tsconfig.json, "strictNullChecks": false,
  //habilitar decoretors no .swcrc "legacyDecorator": true, "decoratorsMetadata": true
  @MaxLength(255, { groups: ['name'] }) //validaçao do dominio, groups: ['name'] validacao por grupos do class validator
  name: string;

  //
  constructor(entity: Genre) {
    Object.assign(this, entity); //copia as propiedades para a entity
  }
}

export class GenreValidator extends ClassValidatorFields {
  //notification= instancia de Notification, data= dados a serem validados, fields= campos que devem ser validados
  //se nao for informados fields, ira validar todos campos
  //quais campos se quer validar
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new GenreRules(data), newFields);
  }
}

export class GenreValidatorFactory {
  static create() {
    return new GenreValidator();
  }
}
