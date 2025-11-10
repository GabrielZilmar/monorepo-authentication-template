import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserDTO, UserMapper } from '@repo/api';
import { ExtractJwt, Strategy } from 'passport-jwt';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import Env from '~/shared/env';

type JwtStrategyValidateParams = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Env.jwtSecret,
    });
  }

  async validate({ sub }: JwtStrategyValidateParams): Promise<UserDTO> {
    const user = await this.userRepository.findOneById(sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserMapper.toDto(user);
  }
}
