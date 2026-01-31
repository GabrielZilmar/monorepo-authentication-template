import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Token, TokenType } from '~/modules/tokens/entities/token.entity';
import CryptoUtils from '~/shared/crypto.util';
import { BaseRepository } from '~/services/database/typeorm/repositories/base/base-repository';

@Injectable()
export default class TokenRepository extends BaseRepository<Token> {
  constructor(entityManager?: EntityManager) {
    super({ entity: Token, uniqueFields: ['hashedToken'], entityManager });
  }

  async createToken(
    userId: string,
    type: TokenType,
    expirationHours: number = 1,
  ): Promise<{ plainToken: string; tokenEntity: Token }> {
    const { token: plainToken, hashedToken } = CryptoUtils.generateToken();
    const expiresAt = CryptoUtils.getTokenExpiry(expirationHours);

    const tokenEntity = await this.save({
      userId,
      type,
      hashedToken,
      expiresAt,
      used: false,
    });

    return { plainToken, tokenEntity };
  }

  async findByHashedToken(
    hashedToken: string,
    type: TokenType,
  ): Promise<Token | null> {
    return this.findOne({
      where: { hashedToken, type, used: false },
      relations: ['user'],
    });
  }

  async markAsUsed(tokenId: string): Promise<void> {
    await this.repository.update(tokenId, {
      used: true,
      usedAt: new Date(),
    });
  }

  async invalidateAllUserTokens(
    userId: string,
    type: TokenType,
  ): Promise<void> {
    await this.repository.update(
      { userId, type, used: false },
      { used: true, usedAt: new Date() },
    );
  }
}
