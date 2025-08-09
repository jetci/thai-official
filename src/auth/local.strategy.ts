import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Use email as the username field
  }

  async validate(email: string, pass:string): Promise<any> {
    const user = await this.authService.login({ email, password: pass }, undefined, undefined);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
