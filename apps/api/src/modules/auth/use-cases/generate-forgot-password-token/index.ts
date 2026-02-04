import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import { UseCase } from '~/shared/core/use-case';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';

@Injectable()
export default class GenerateForgotPasswordToken
  implements UseCase<string, string>
{
  constructor(private readonly dataSource: DataSource) {}

  async execute(userId: string): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const tokenRepository = new TokenRepository(manager);

      const existingToken = await tokenRepository.findValidToken(
        userId,
        TokenType.PASSWORD_RESET,
      );
      if (existingToken) {
        throw new BadRequestException(
          `Please wait  ${Math.floor(TOKEN_EXPIRATION.PASSWORD_RESET * 60)} minutes before requesting a new password reset email`,
        );
      }

      await tokenRepository.invalidateAllUserTokens(
        userId,
        TokenType.PASSWORD_RESET,
      );

      const { plainToken } = await tokenRepository.createToken(
        userId,
        TokenType.PASSWORD_RESET,
        TOKEN_EXPIRATION.PASSWORD_RESET,
      );

      return plainToken;
    });
  }
}
