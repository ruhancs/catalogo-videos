import { ClassValidatorFields } from "../../domain/validators/class-validator-field";
import { EntityValidationError } from "../../domain/validators/validation_error";
import { FieldsErrors } from "../../domain/validators/validator-fields-interface";

//Expected ou é o objeto com validator e data ou uma funcao
type Expected = | {
    validator: ClassValidatorFields<any>;
    data: any
} | (() => any )

//alterar a typagem do jest em jest.d.ts para adicionar essa funcao
//configurar no jest.config para carregar a funcao 
/*
  setupFilesAfterEnv: [
      './@shared/infra/testing/expected_helpers.ts'
    ],
*/ 
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