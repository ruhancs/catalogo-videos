import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { applyGlobalConfig } from '../../global-config';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

export function startApp() {
  let _app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    //pegar instacia do sequelize que foi criada para o teste
    const sequelize = moduleFixture.get<Sequelize>(getConnectionToken());
    await sequelize.sync({ force: true }); //apagar as tabelas criadas nos testes

    _app = moduleFixture.createNestApplication();
    //configuracao do filters e interceptors
    applyGlobalConfig(_app);
    await _app.init();
  });

  //evitar vazamento de memoria
  afterEach(async () => {
    //caso o beforeEach nao consiga iniciar _app, _app sera undefined
    //entao usa ? (optional channing do js) para verificar se _app é undefined ou nao
    await _app?.close();
  });

  //pegar variavel privada do escopo do jest
  return {
    get app() {
      return _app;
    },
  };
}
