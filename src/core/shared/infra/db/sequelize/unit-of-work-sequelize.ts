import { Sequelize, Transaction } from 'sequelize';
import { IUnitOfWork } from '../../../domain/repository/unit-of-work.interface';
import { AggregateRoot } from '../../../domain/aggregate-root';

//mikro/orm é utilizado para implementar o unit of work completo padrao (data mapper)
//padrao do sequelize (active recorde) nao implementa unit of work
export class UnitOfWorkSequelize implements IUnitOfWork {
  //instancia do transaction do sequelize
  private transaction: Transaction | null;
  //set para evitar que o aggregateRoot nao seja adicionado mais de 1 vez
  private aggregateRoots: Set<AggregateRoot> = new Set<AggregateRoot>();

  constructor(private sequelize: Sequelize) {}

  async start(): Promise<void> {
    //verificar se ja existe uma transacao em andamento, se nao tiver cria uma transacao
    if (!this.transaction) {
      this.transaction = await this.sequelize.transaction();
    }
  }
  async commit(): Promise<void> {
    this.validateTransaction(); //verificar se existe transacao criada
    await this.transaction!.commit();
    this.transaction = null; //ao finalizar esvazia a transacao
  }

  async rollback(): Promise<void> {
    this.validateTransaction(); //verificar se existe transacao criada
    await this.transaction!.rollback();
    this.transaction = null; //ao finalizar esvazia a transacao
  }

  getTransaction() {
    return this.transaction;
  }

  async do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    let isAutoTransaction = false; //verificar se a transacao ja iniciou, evitar um novo trycatch
    try {
      if (this.transaction) {
        //se a transacao ja existir, passa o propio uow para o workFn fazer as transacaoes
        const result = await workFn(this);
        this.transaction = null;
        return result;
      }

      //se a transacao nao estiver criada, cria uma transacao do sequelize e inseri em this.transaction
      //passa o uow para o workFn executar as transacoes
      return await this.sequelize.transaction(async (t) => {
        isAutoTransaction = true;
        this.transaction = t;
        const result = await workFn(this);
        this.transaction = null;
        return result;
      });
    } catch (e) {
      //em caso de erro e a transacao estiver iniciado, realiza rollback nas transacoes
      if (!isAutoTransaction) {
        this.transaction?.rollback();
      }
      this.transaction = null;
      throw e;
    }
  }

  private validateTransaction() {
    if (!this.transaction) {
      throw new Error('No transaction started');
    }
  }

  // adiciona agregado no uow para os servicos enviar os eventos do agregado
  addAggregateRoot(aggregateRoot: AggregateRoot): void {
    this.aggregateRoots.add(aggregateRoot);
  }

  getAggregateRoots(): AggregateRoot[] {
    return [...this.aggregateRoots];
  }
}
