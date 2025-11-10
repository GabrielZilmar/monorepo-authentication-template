import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import Env from '~/shared/env';
import { UserRequest } from '~/types/user-request.type';

type JwtStrategyValidateParams = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Env.jwtSecret,
    });
  }

  validate(payload: JwtStrategyValidateParams): UserRequest {
    return { userId: payload.sub, email: payload.email };
  }
}
