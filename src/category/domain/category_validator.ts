import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"
import { Category } from "./category.entity"
import { ClassValidatorFields } from "../../@shared/domain/validators/class-validator-field"


class CategoryRules {
    //habilitar decorators em tsconfig.json, "experimentalDecorators": true, "emitDecoratorMetadata": true,
    //desabilitar a checagem de null no tsconfig.json, "strictNullChecks": false,
    //habilitar decoretors no .swcrc "legacyDecorator": true, "decoratorsMetadata": true
    @MaxLength(255) // validacao de dominio
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    description: string | null

    @IsBoolean()
    @IsNotEmpty()
    is_active: boolean

    constructor({name,description,is_active}: Category) {
        Object.assign(this, {name,description,is_active})
    }
}

export class CategoryValidator extends ClassValidatorFields<CategoryRules> {
    validate(entity: Category) {
        return super.validate(new CategoryRules(entity))
    }
}

export class CategoryValidatorFactory {
    static create() {
        return new CategoryValidator()
    }
}