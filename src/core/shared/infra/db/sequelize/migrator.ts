import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug, UmzugOptions } from 'umzug';

//migracoes das tabelas para o db
export function migrator(
  sequelize: Sequelize,
  options?: Partial<UmzugOptions>,
) {
  return new Umzug({
    migrations: {
      //pasta onde sera adicionado as migrations
      glob: [
        '*/infra/db/sequelize/migrations/*.{js,ts}',
        //pasta onde iniciara as buscas, retorna 4 dirs ate a pasta core
        {
          cwd: join(__dirname, '..', '..', '..', '..'),
          //ignorar arquivos de tipagem do js em producao
          ignore: ['**/*.d.ts', '**/index.ts', '**/index.js'],
        },
      ],
    },
    context: sequelize,
    //onde sera armazenado a execucao das migracoes
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
    //se haver mais opcoes inseri elas, caso nao haver nao inseri
    ...(options || {}),
  });
}
