import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FakeService {
  //receber 'test' evento, emitido por EventEmitterModule
  //ao eventEmitter disparar o evento teste executa handle com o evento recebido
  @OnEvent('test')
  handle(event) {
    console.log(event);
  }
}

/*
alguma parte do software que disparar o evento test, a funcao handle sera executada
eventEmitter2.emit('test', {data: 'evento que sera recebido'})
*/
