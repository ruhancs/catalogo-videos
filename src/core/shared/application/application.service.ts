import { DomainEventMediator } from '../domain/events/domain-event-mediator';
import { IUnitOfWork } from '../domain/repository/unit-of-work.interface';

//auxiliar para a camada de aplicacao use cases
export class ApplicationService {
  constructor(
    private uow: IUnitOfWork,
    private domainEventMediator: DomainEventMediator,
  ) {}

  //coordenar a execucao do que se quer fazer
  async start() {
    //iniciar transacao
    await this.uow.start();
  }

  async finish() {
    //pegar todos agregados inseridos no uow
    const aggregateRoots = [...this.uow.getAggregateRoots()];

    //para cada agregado no uow, executa os eventos, que estao em espera para ser executados
    for (const aggregateRoot of aggregateRoots) {
      //os eventos adicionados em events dos agregados sao executados sequencialmente
      await this.domainEventMediator.publish(aggregateRoot);
    }

    //termnar as transacoes do uow, garantir consistencia das operacoes acima
    await this.uow.commit();

    //percorrer os agregados novamente para publicar os eventos de integracao apos o commit,
    //eventos de integracao realizam tarefas fora do subdominio
    for (const aggregateRoot of aggregateRoots) {
      await this.domainEventMediator.publishIntegrationEvents(aggregateRoot);
    }
  }

  async fail() {
    this.uow.rollback();
  }

  //executar a funcao do callback, se der error nao faz commit da transacao
  async run<T>(callback: () => Promise<T>): Promise<T> {
    await this.start();
    try {
      const result = await callback();
      await this.finish(); //commit da transacao
      return result;
    } catch (error) {
      this.fail(); //rollback da transacao
      throw error;
    }
  }
}
