import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PayloadUser } from './user-model';

//AuthGuard depende do servico de authenticacao
@Injectable()
export class CheckIsAdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext, //contexto pode ser http, rpc
  ): boolean | Promise<boolean> | Observable<boolean> {
    //se o contexto for diferente de http nao precisa authenticacao
    if (context.getType() !== 'http') {
      return true;
    }

    //pegar informacoes da request
    const request: Request = context.switchToHttp().getRequest();
    //verificar se tem usuario no contexto da request
    if (!('user' in request)) {
      throw new UnauthorizedException();
    }

    const payload = request['user'] as PayloadUser;
    const roles = payload?.realm_access?.roles || [];
    //se o payload nao tiver a role admin-catalog
    if (roles.indexOf('admin-catalog') === -1) {
      throw new ForbiddenException();
    }

    return true;
  }
}
