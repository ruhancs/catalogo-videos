// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FieldsErrors } from './shared/domain/validators/validator-fields-interface';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ValueObject } from './shared/domain/value_object';

declare global {
  namespace jest {
    interface Matchers<R> {
      //containsErrorMessages: (expected: FieldsErrors) => R;
      notificationContainsErrorMessages: (
        expected: Array<string | { [key: string]: string[] }>,
      ) => R;
      toBeValueObject: (expected: ValueObjecteObject) => R;
    }
  }
}
