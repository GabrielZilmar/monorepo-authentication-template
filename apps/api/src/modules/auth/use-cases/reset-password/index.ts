import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '~/modules/users/entities/user.entity';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import CryptoUtils from '~/shared/crypto.util';
import PasswordUtils from '~/shared/password.util';
import { UseCase } from '~/shared/core/use-case';

export interface ResetPasswordInput {
  token: string;
  password: string;
}

@Injectable()
export default class ResetPassword
  implements UseCase<ResetPasswordInput, void>
{
  constructor(private readonly dataSource: DataSource) {}

  async execute({ token, password }: ResetPasswordInput): Promise<void> {
    const hashedToken = CryptoUtils.hashToken(token);

    return this.dataSource.transaction(async (manager) => {
      const tokenRepository = new TokenRepository(manager);
      const sessionRepository = new SessionRepository(manager);
      const userRepository = manager.getRepository(User);

      const tokenEntity = await tokenRepository.findByHashedToken(
        hashedToken,
        TokenType.PASSWORD_RESET,
      );

      if (!tokenEntity) {
        throw new NotFoundException('Invalid or expired reset token');
      }

      if (CryptoUtils.isTokenExpired(tokenEntity.expiresAt)) {
        throw new BadRequestException('Reset token has expired');
      }

      if (tokenEntity.used) {
        throw new BadRequestException('Reset token has already been used');
      }

      const user = await userRepository.findOne({
        where: { id: tokenEntity.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { passwordSalt, passwordHash } =
        await PasswordUtils.encrypt(password);
      user.password = passwordHash;
      user.passwordSalt = passwordSalt;

      await userRepository.save(user);

      await tokenRepository.markAsUsed(tokenEntity.id);

      await sessionRepository.deactivateAllUserSessions(user.id);
    });
  }
}
