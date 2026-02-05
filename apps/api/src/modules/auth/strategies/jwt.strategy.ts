import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserDTO, UserMapper } from '@repo/api';
import { ExtractJwt, Strategy } from 'passport-jwt';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import Env from '~/shared/env';

type JwtStrategyValidateParams = {
  sub: string;
  email: string;
  sessionId: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Env.jwtSecret,
    });
  }

  async validate({
    sub,
    sessionId,
  }: JwtStrategyValidateParams): Promise<UserDTO & { sessionId: string }> {
    const user = await this.userRepository.findOneById(sub);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const session = await this.sessionRepository.findOneById(sessionId);
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session is no longer active');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deactivateSession(sessionId);
      throw new UnauthorizedException('Session expired');
    }

    return { ...UserMapper.toDto(user), sessionId };
  }
}
