import { DomainEventMediator } from '@core/shared/domain/events/domain-event-mediator';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { ApplicationService } from '../application.service';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '@core/shared/domain/value_object';

class StubAggregate extends AggregateRoot {
  get entity_id(): ValueObject {
    throw new Error('Method not implemented.');
  }
  toJSON() {
    throw new Error('Method not implemented.');
  }
}

describe('ApplicationService Unit Tests', () => {
  let uow: IUnitOfWork;
  let domainEventMediator: DomainEventMediator;
  let applicationService: ApplicationService;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    const eventEmitter = new EventEmitter2();
    domainEventMediator = new DomainEventMediator(eventEmitter);
    applicationService = new ApplicationService(uow, domainEventMediator);
  });

  describe('start', () => {
    it('should call the start method of unit of work', async () => {
      const startSpy = jest.spyOn(uow, 'start');
      applicationService.start();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('fail', () => {
    it('should call rollback method of uow', async () => {
      const rollbackSpy = jest.spyOn(uow, 'rollback');
      await applicationService.fail();
      expect(rollbackSpy).toHaveBeenCalled();
    });
  });

  describe('finish', () => {
    it('should call the publish method of domain mediator and commit method', async () => {
      const aggregate = new StubAggregate();
      //adiciona o agregado no uow para dispara os eventos do agregado
      uow.addAggregateRoot(aggregate);
      const publishSpy = jest.spyOn(domainEventMediator, 'publish');
      const publishIntegrationEventsSpy = jest.spyOn(
        domainEventMediator,
        'publishIntegrationEvents',
      );
      const commitSpy = jest.spyOn(uow, 'commit');

      await applicationService.finish();
      expect(publishSpy).toHaveBeenCalledWith(aggregate);
      expect(commitSpy).toHaveBeenCalled();
      expect(publishIntegrationEventsSpy).toHaveBeenCalledWith(aggregate);
    });
  });

  describe('run', () => {
    it('should start, execute the callback, finish and return the result', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      const startSpy = jest.spyOn(applicationService, 'start');
      const finishSpy = jest.spyOn(applicationService, 'finish');

      const result = await applicationService.run(callback);

      expect(startSpy).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(finishSpy).toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });
});
