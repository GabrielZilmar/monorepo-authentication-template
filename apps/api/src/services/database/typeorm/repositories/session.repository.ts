import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Session } from '~/modules/auth/entities/session.entity';
import CryptoUtils from '~/shared/crypto.util';
import { BaseRepository } from '~/services/database/typeorm/repositories/base/base-repository';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';

@Injectable()
export default class SessionRepository extends BaseRepository<Session> {
  constructor(entityManager?: EntityManager) {
    super({ entity: Session, uniqueFields: ['refreshToken'], entityManager });
  }

  async createSession(
    userId: string,
    expirationHours: number = TOKEN_EXPIRATION.REFRESH_TOKEN,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<{ refreshToken: string; session: Session }> {
    const { token: refreshToken, hashedToken } = CryptoUtils.generateToken();
    const expiresAt = CryptoUtils.getTokenExpiry(expirationHours);

    const session = await this.save({
      userId,
      refreshToken: hashedToken,
      expiresAt,
      isActive: true,
      userAgent: metadata?.userAgent || null,
      ipAddress: metadata?.ipAddress || null,
      lastUsedAt: new Date(),
    });

    return { refreshToken, session };
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const hashedToken = CryptoUtils.hashToken(refreshToken);
    return this.findOne({
      where: { refreshToken: hashedToken, isActive: true },
      relations: ['user'],
    });
  }

  async updateLastUsed(sessionId: string): Promise<void> {
    await this.repository.update(sessionId, {
      lastUsedAt: new Date(),
    });
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.repository.update(sessionId, {
      isActive: false,
    });
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.repository.update(
      { userId, isActive: true },
      { isActive: false },
    );
  }

  async findActiveSessions(userId: string): Promise<Session[]> {
    return this.repository.find({
      where: { userId, isActive: true },
      order: { lastUsedAt: 'DESC' },
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Session)
      .set({ isActive: false })
      .where('expiresAt < :now', { now: new Date() })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
  }
}
