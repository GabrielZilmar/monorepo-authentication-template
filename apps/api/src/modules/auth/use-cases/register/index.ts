import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDTO, UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';
import SendVerificationEmail from '~/modules/auth/use-cases/send-verification-email';

type RegisterUserParams = {
  email: string;
  password: string;
  username: string;
};
type RegisterUserResult = { user: UserDTO; accessToken: string };

@Injectable()
export default class RegisterUser
  implements UseCase<RegisterUserParams, RegisterUserResult>
{
  constructor(
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly sendVerificationEmail: SendVerificationEmail,
  ) {}

  async execute({
    email,
    password,
    username,
  }: RegisterUserParams): Promise<RegisterUserResult> {
    const user = await this.userRepository.create({
      email,
      password,
      username,
    });
    const userDTO = UserMapper.toDto(user);

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    this.sendVerificationEmail.execute(user.id).catch((error) => {
      this.logger.error('Failed to send verification email:', error);
    });

    return {
      user: userDTO,
      accessToken,
    };
  }
}
