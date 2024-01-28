import { Entity } from './entity';
import { IDomainEvent } from './events/domain-event.interface';
import EventEmitter2 from 'eventemitter2';

//utilizado para descrever os aggregados, separar de entidades
//agregado lida com eventos de dominio, algo que a entidade nao lida
export abstract class AggregateRoot extends Entity {
  //toda vez que o agregado iniciar criara um set de IDomainEvent
  //so adicona o evento uma vez
  //events contem os eventos que sera disparados pelo metodo publish
  events: Set<IDomainEvent> = new Set<IDomainEvent>();

  //armazenar os eventos que ja foram disparados
  dispatchedEvents: Set<IDomainEvent> = new Set<IDomainEvent>();

  //coordena as notificacoes entre os objetos no escopo local do aggregado
  localMediator = new EventEmitter2();

  //recebe o evento que sera registrado
  //evento sao os dados do que aconteceu
  //dispara o evento dentro do agregado
  applyEvent(event: IDomainEvent) {
    //registrar o evento em events, para outras areas se registrar para receber o evento
    //publish dispara os eventos registrados em events
    this.events.add(event);
    //disparar o evento pegando o nome da propia classe, que sera o nome do evento
    this.localMediator.emit(event.constructor.name, event);
  }

  //recebe o nome do evento, e a funcao que o evento ira disparar
  //registra a funcao que sera disparada pelo evento
  //ouvir o evento dentro do agregado
  registerHandler(event: string, handler: (event: IDomainEvent) => void) {
    //quando acontecer o evento que é o nome da classe, dispara o handler
    this.localMediator.on(event, handler);
  }

  //marcar um evento como disparado
  markEventAsDispatched(event: IDomainEvent) {
    this.dispatchedEvents.add(event);
  }

  getUncommitedEvents(): IDomainEvent[] {
    //retornar os eventos que nao estao no set de eventos disparados
    return Array.from(this.events).filter(
      (event) => !this.dispatchedEvents.has(event),
    );
  }

  clearEvents() {
    this.events.clear();
    this.dispatchedEvents.clear();
  }
}
