import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO, LoginResponseDTO } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';
import PasswordUtils from '~/shared/password.util';

type LoginParams = LoginDTO;
type LoginResponse = LoginResponseDTO;

@Injectable()
export default class Login implements UseCase<LoginParams, LoginResponse> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ email, password }: LoginParams): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await PasswordUtils.compare({
      password,
      passwordHashed: user.password,
    });
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
