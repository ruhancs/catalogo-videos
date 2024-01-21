import { MaxLength } from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-field';
import { Notification } from '../../shared/domain/validators/notification';
import { CastMember } from './cast-member.aggregate';

class CastMemberRules {
  //habilitar decorators em tsconfig.json, "experimentalDecorators": true, "emitDecoratorMetadata": true,
  //desabilitar a checagem de null no tsconfig.json, "strictNullChecks": false,
  //habilitar decoretors no .swcrc "legacyDecorator": true, "decoratorsMetadata": true
  @MaxLength(255, { groups: ['name'] }) //validaçao do dominio, groups: ['name'] validacao por grupos do class validator
  name: string;

  constructor(entity: CastMember) {
    Object.assign(this, entity); //copia as propiedades para a entity
  }
}

export class CastMemberValidator extends ClassValidatorFields {
  //notification= instancia de Notification, data= dados a serem validados, fields= campos que devem ser validados
  //se nao for informados fields, ira validar todos campos
  //quais campos se quer validar
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new CastMemberRules(data), newFields);
  }
}

export class CastMemberValidatorFactory {
  static create() {
    return new CastMemberValidator();
  }
}
