import { ApplicationService } from '../../core/shared/application/application.service';
import { DomainEventMediator } from '../../core/shared/domain/events/domain-event-mediator';
import { IUnitOfWork } from '../../core/shared/domain/repository/unit-of-work.interface';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: ApplicationService,
      useFactory: (
        uow: IUnitOfWork,
        domainEventMediattor: DomainEventMediator,
      ) => {
        return new ApplicationService(uow, domainEventMediattor);
      },
      //UnitOfWork declarado em database.module, UnitOfWork é Scope.REQUEST
      //ApplicationService se torna Scope.REQUEST pois depende de UnitOfWork, cada vez que é chamado cria uma stancia
      inject: ['UnitOfWork', DomainEventMediator],
      // cria uma instancia de ApplicationService em cada requisicao
      //scope: Scope.REQUEST,
    },
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
