import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import ValidateUser from '~/modules/auth/use-cases/validate-user';
import { UserDTO } from '@repo/api';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly validateUser: ValidateUser) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<UserDTO> {
    const user = await this.validateUser.execute({ email, password });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
