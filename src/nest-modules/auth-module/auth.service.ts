import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(email: string, password: string) {
    const payload = { name: 'test' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
