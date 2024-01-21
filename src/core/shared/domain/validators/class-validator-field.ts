import { validateSync } from 'class-validator';
import { IValidatorFields } from './validator-fields-interface';
import { Notification } from './notification';

//validacao dos campos
export abstract class ClassValidatorFields implements IValidatorFields {
  validate(notification: Notification, data: any, fields: string[]): boolean {
    const errors = validateSync(data, {
      groups: fields,
    });
    if (errors.length) {
      for (const error of errors) {
        //percorre todos erros e adiciona no Notification
        const field = error.property;
        Object.values(error.constraints!).forEach((message) => {
          notification.addError(message, field);
        });
      }
    }
    return !errors.length;
  }
}
