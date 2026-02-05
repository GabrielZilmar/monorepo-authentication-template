import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDTO } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import { UseCase } from '~/shared/core/use-case';
import PasswordUtils from '~/shared/password.util';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';

type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
};
type LoginResponse = LoginResponseDTO;

@Injectable()
export default class Login implements UseCase<LoginParams, LoginResponse> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute({
    email,
    password,
    userAgent,
    ipAddress,
  }: LoginParams): Promise<LoginResponse> {
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

    const { refreshToken, session } =
      await this.sessionRepository.createSession(
        user.id,
        TOKEN_EXPIRATION.REFRESH_TOKEN,
        { userAgent, ipAddress },
      );

    const payload = { sub: user.id, email: user.email, sessionId: session.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: `${TOKEN_EXPIRATION.ACCESS_TOKEN}h`,
    });

    return { accessToken, refreshToken };
  }
}
