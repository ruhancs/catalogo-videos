import { ValueObject } from '../../domain/value_object';
import { Notification } from '../../domain/validators/notification';

//alterar a typagem do jest em jest.d.ts para adicionar essa funcao
//configurar no jest.config para carregar a funcao
// setupFilesAfterEnv: ["./shared/infra/testing/expect-helpers.ts"],
expect.extend({
  notificationContainsErrorMessages(
    expected: Notification,
    received: Array<string | { [key: string]: string[] }>,
  ) {
    //verificar se oque esta no array tem dentro do notification
    const every = received.every((error) => {
      if (typeof error === 'string') {
        return expected.errors.has(error);
      } else {
        return Object.entries(error).every(([field, messages]) => {
          const fieldMessages = expected.errors.get(field) as string[];

          return (
            fieldMessages &&
            fieldMessages.length &&
            fieldMessages.every((message) => messages.includes(message))
          );
        });
      }
    });
    return every
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () =>
            `The validation errors not contains ${JSON.stringify(
              received,
            )}. Current: ${JSON.stringify(expected.toJSON())}`,
        };
  },
  toBeValueObject(expected: ValueObject, received: ValueObject) {
    return expected.equals(received)
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () =>
            `The values object are not equal. Expected: ${JSON.stringify(
              expected,
            )} | Received: ${JSON.stringify(received)}`,
        };
  },
  // containsErrorMessages(expected: Expected, received: FieldsErrors) {
  //   if (typeof expected === "function") {
  //     try {
  //       expected();
  //       return isValid();
  //     } catch (e) {
  //       const error = e as EntityValidationError;
  //       return assertContainsErrorsMessages(error.error, received);
  //     }
  //   } else {
  //     const { validator, data } = expected;
  //     const validated = validator.validate(data);

  //     if (validated) {
  //       return isValid();
  //     }

  //     return assertContainsErrorsMessages(validator.errors, received);
  //   }
  // },
});

//Expected ou é o objeto com validator e data ou uma funcao
/*
type Expected = | {
    validator: ClassValidatorFields<any>;
    data: any
} | (() => any )

//alterar a typagem do jest em jest.d.ts para adicionar essa funcao
//configurar no jest.config para carregar a funcao 
setupFilesAfterEnv: ["./shared/infra/testing/expect-helpers.ts"],
expect.extend({
  containsErrorMessages(expected: Expected, received: FieldsErrors) {
        if (typeof expected === "function") {
            try {
              expected();
              return isValid();
            } catch (e) {
              const error = e as EntityValidationError;
              return assertContainsErrorsMessages(error.error, received);
            }
        } else {
        const { validator, data } = expected;
        const validated = validator.validate(data);
    
        if (validated) {
            return isValid();
        }
    
        return assertContainsErrorsMessages(validator.errors, received);
        }
    }
})

function assertContainsErrorsMessages(
    expected: FieldsErrors,
    received: FieldsErrors
    ) {
      //verificar se o expected e received sao iguais
    const isMatch = expect.objectContaining(received).asymmetricMatch(expected);
  
    return isMatch
      ? isValid() //se forem iguais
      : {
          pass: false,
          message: () =>
            `The validation errors not contains ${JSON.stringify(
              received
            )}. Current: ${JSON.stringify(expected)}`,
        };
  }
  
function isValid() {
  return { pass: true, message: () => "" };
}
*/
