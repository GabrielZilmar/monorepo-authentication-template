import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import { UseCase } from '~/shared/core/use-case';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';

@Injectable()
export default class GenerateEmailVerificationToken
  implements UseCase<string, string>
{
  constructor(private readonly dataSource: DataSource) {}

  async execute(userId: string): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const tokenRepository = new TokenRepository(manager);

      await tokenRepository.invalidateAllUserTokens(
        userId,
        TokenType.EMAIL_VERIFICATION,
      );

      const { plainToken } = await tokenRepository.createToken(
        userId,
        TokenType.EMAIL_VERIFICATION,
        TOKEN_EXPIRATION.EMAIL_VERIFICATION,
      );

      return plainToken;
    });
  }
}
