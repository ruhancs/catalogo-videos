import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

//AuthGuard depende do servico de authenticacao
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext, //contexto pode ser http, rpc
  ): boolean | Promise<boolean> | Observable<boolean> {
    //se o contexto for diferente de http nao precisa authenticacao
    if (context.getType() !== 'http') {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest(); //converter contexto para http, captura a request
    const token = this.extarctTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token);
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private extarctTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []; //Bearer token, pegar somente o token
    return type === 'Bearer' ? token : undefined;
  }
}
