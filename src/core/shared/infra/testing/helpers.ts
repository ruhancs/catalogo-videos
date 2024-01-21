import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Config } from '../config';

export function setupSequelize(options: SequelizeOptions = {}) {
  let _sequelize: Sequelize;
  beforeAll(async () => {
    _sequelize = new Sequelize({
      ...Config.db(), //variaveis de ambiente
      ...options,
    });
  });

  beforeEach(async () => await _sequelize.sync({ force: true })); //para testes, apagar os dados toda ve que reiniciar)

  afterAll(async () => await _sequelize.close());

  return {
    get sequelize() {
      return _sequelize;
    },
  };
}
