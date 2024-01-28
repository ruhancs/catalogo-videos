import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FakeService } from './fake-service';
import { DomainEventMediator } from '@core/shared/domain/events/domain-event-mediator';
import EventEmitter2 from 'eventemitter2';

@Global()
@Module({
  //adicionar EventEmitterModule (eventEmmiter2) globalmente
  //rastreia todos servicos que possuem @OnEvent('nome-evento') para enviar os eventos
  imports: [EventEmitterModule.forRoot()],
  providers: [
    // FakeService é um exemplo de listener de eventos
    FakeService,
    {
      //injetar DomainEventMediator nos outros modulos
      provide: DomainEventMediator, //registrar os ouvintes e faz a publicacao dos eventos
      useFactory: (eventEmitter: EventEmitter2) => {
        return new DomainEventMediator(eventEmitter);
      },
      inject: [EventEmitter2],
    },
  ],
  exports: [DomainEventMediator],
})
export class EventModule {}
