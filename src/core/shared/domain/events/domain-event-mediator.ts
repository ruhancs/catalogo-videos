import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../aggregate-root';

export class DomainEventMediator {
  constructor(private eventEmitter: EventEmitter2) {}

  //registrar um listener, para escutar um evento
  //o event e o nome da classe do evento, handler é a funcao que disparado para o evento
  register(event: string, handler: any) {
    //quando o evento acontece executa o handler
    this.eventEmitter.on(event, handler);
  }

  //publicar o evento
  async publish(aggregateRoot: AggregateRoot) {
    //extrair todos eventos de um agregado, somente os eventos que nao foram disparados
    for (const event of aggregateRoot.getUncommitedEvents()) {
      //pegar o nome da instancia do evento
      const eventClassName = event.constructor.name;

      //marcar o evento como disparado
      aggregateRoot.markEventAsDispatched(event);

      //executar os consumidores do evento de forma sequencial,
      //executar o evento que é o nome da classe, e enviar o evento para o ouvinte ser notificado
      await this.eventEmitter.emitAsync(eventClassName, event);
    }
  }

  async publishIntegrationEvents(aggregateRoot: AggregateRoot) {
    //pegar os eventos do agregado
    for (const event of aggregateRoot.events) {
      //getIntegrationEvent é metodo opcional em IDomainEvent, alguns eventos nao possuem evento de integracao
      //?.() evitar if se metodo existe ou nao, posi o metodo é opcional
      const integartionEvent = event.getIntegrationEvent?.();
      //se nao existir evento de integracao vai para o proximo
      if (!integartionEvent) continue;

      //disparar evento de integracao
      await this.eventEmitter.emitAsync(
        integartionEvent.constructor.name,
        integartionEvent,
      );
    }
  }
}
