import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '~/modules/users/entities/user.entity';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import CryptoUtils from '~/shared/crypto.util';
import { UseCase } from '~/shared/core/use-case';

@Injectable()
export default class VerifyEmail implements UseCase<string, void> {
  constructor(private readonly dataSource: DataSource) {}

  async execute(token: string): Promise<void> {
    const hashedToken = CryptoUtils.hashToken(token);

    return await this.dataSource.transaction(async (manager) => {
      const tokenRepository = new TokenRepository(manager);
      const userRepository = manager.getRepository(User);

      const tokenEntity = await tokenRepository.findByHashedToken(
        hashedToken,
        TokenType.EMAIL_VERIFICATION,
      );

      if (!tokenEntity) {
        throw new NotFoundException('Invalid or expired verification token');
      }

      if (CryptoUtils.isTokenExpired(tokenEntity.expiresAt)) {
        throw new BadRequestException('Verification token has expired');
      }

      if (tokenEntity.used) {
        throw new BadRequestException(
          'Verification token has already been used',
        );
      }

      const user = await userRepository.findOne({
        where: { id: tokenEntity.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.emailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      user.emailVerified = true;
      await userRepository.save(user);

      await tokenRepository.markAsUsed(tokenEntity.id);
    });
  }
}
