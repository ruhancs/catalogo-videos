import { AggregateRoot } from '../aggregate-root';

export interface IUnitOfWork {
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  //instacia de transaction do orm
  getTransaction(): any;
  do<T>(workFunction: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
  addAggregateRoot(aggregatRoot: AggregateRoot): void;
  getAggregateRoots(): AggregateRoot[];
}
