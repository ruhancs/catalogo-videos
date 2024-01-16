import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
//rxjs lida com fluxos de eventos, no js é uma camada acima da promisse, adiciona recursos nas promisses
import { Observable, map } from 'rxjs';

//interceptor de saida para os controllers, adiciona o interceptor globalmente no main
@Injectable()
export class WrapperDataInterceptor implements NestInterceptor {
  //context = contexto da execucao ex http ou outro protocolo, next = cria um streaming para transformar a resposta
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      //se nao tiver body ou se tiver meta no body retorna o body, nao interfere em controller com esses parametros
      //em outros casos adiciona body dentro de data para a saida
      map((body) => (!body || 'meta' in body ? body : { data: body })),
    );
  }
}
