import { Module } from '@nestjs/common';
import {
  ConfigModuleOptions,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import Joi from 'joi';
import { join } from 'path';

//transformar dados object para string
//@ts-expect-error - the type is correct
const joiJson = Joi.extend((joi) => {
  return {
    type: 'object', //ver qnd o dado é um obj, alterar o tipo padrao obj do joi
    base: joi.object(),
    //verificar se tem que converter o obj ou nao, se iniciar sem { no inicio retorna o valor original
    // coerce responsavel por converter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    coerce(value, _schema) {
      //verificar se inicia com { no inicio
      if (value[0] !== '{' && !/^\s*\{/.test(value)) {
        return;
      }

      //tentar converter qnd inicia com { para string
      try {
        return { value: JSON.parse(value) };
      } catch (err) {
        console.error(err);
      }
    },
  };
});

type DB_SCHEMA_TYPE = {
  DB_VENDOR: 'mysql' | 'sqlite';
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_LOGGING: boolean;
  DB_AUTO_LOAD_MODELS: boolean;
};

export const CONFIG_DB_SCHEMA: Joi.StrictSchemaMap<DB_SCHEMA_TYPE> = {
  DB_VENDOR: Joi.string().required().valid('mysql', 'sqlite'),
  DB_HOST: Joi.string().required(),
  DB_DATABASE: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_USERNAME: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_PASSWORD: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_PORT: Joi.number().integer().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_LOGGING: Joi.boolean().required(),
  DB_AUTO_LOAD_MODELS: Joi.boolean().required(),
};
//tipagem do schema do .env, usado em database module
export type CONFIG_SCHEMA_TYPE = DB_SCHEMA_TYPE;

//tipagem do schema do .env das variavei para usar no google storage
type CONFIG_GOOGLE_SCHEMA_TYPE = {
  GOOGLE_CLOUD_CREDENTIALS: object; //configModule converte de obj para string, para ser utilizado no sdk
  GOOGLE_CLOUD_STORAGE_BUCKET_NAME: string;
};

export const CONFIG_GOOGLE_SCHEMA: Joi.StrictSchemaMap<CONFIG_GOOGLE_SCHEMA_TYPE> =
  {
    GOOGLE_CLOUD_CREDENTIALS: joiJson.object().required(), // joi customizado para converter de obj para string
    GOOGLE_CLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
  };

type CONFIG_RABBITMQ_SCHEMA_TYPE = {
  RABBITMQ_URI: string;
  RABBITMQ_REGISTER_HANDLERS: boolean;
};

export const CONFIG_RABBITMQ_SCHEMA: Joi.StrictSchemaMap<CONFIG_RABBITMQ_SCHEMA_TYPE> =
  {
    RABBITMQ_URI: Joi.string().required(),
    RABBITMQ_REGISTER_HANDLERS: Joi.boolean().required(),
  };

type CONFIG_JWT_SCHEMA_TYPE = {
  JWT_PUBLIC_KEY: string;
  JWT_PRIVATE_KEY: string;
};

export const CONFIG_JWT_SCHEMA: Joi.StrictSchemaMap<CONFIG_JWT_SCHEMA_TYPE> = {
  JWT_PUBLIC_KEY: Joi.string().required(),
  JWT_PRIVATE_KEY: Joi.string().optional(),
};

@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot(options: ConfigModuleOptions = {}) {
    const { envFilePath, ...otherOptiosn } = options;
    return super.forRoot({
      isGlobal: true,
      //process.cwd() = caminho pasta atual, carrega diversos env diferents
      envFilePath: [
        //verificar se existe envFilePath em options, para sobrescrever os env que vem depois
        ...(Array.isArray(envFilePath) ? envFilePath! : [envFilePath!]),
        join(process.cwd(), 'envs', `.env.${process.env.NODE_ENV}`),
        join(process.cwd(), 'envs', `.env`),
      ],
      validationSchema: Joi.object({
        ...CONFIG_DB_SCHEMA,
        ...CONFIG_GOOGLE_SCHEMA,
        ...CONFIG_RABBITMQ_SCHEMA,
        ...CONFIG_JWT_SCHEMA,
      }),
      ...otherOptiosn,
    });
  }
}
