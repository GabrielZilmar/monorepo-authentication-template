import { describe, it, expect, beforeEach } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import RefreshToken from './index';
import { buildSession } from 'test/test-utils/factories';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';
import { User } from '~/modules/users/entities/user.entity';

describe('RefreshToken Use Case', () => {
  let sessionRepository: jest.Mocked<SessionRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshToken: RefreshToken;

  beforeEach(() => {
    sessionRepository = {
      findByRefreshToken: jest.fn(),
      deactivateSession: jest.fn(),
      updateLastUsed: jest.fn(),
    } as unknown as jest.Mocked<SessionRepository>;
    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    refreshToken = new RefreshToken(jwtService, sessionRepository);
  });

  it('should throw when refresh token is invalid', async () => {
    sessionRepository.findByRefreshToken.mockResolvedValue(null);

    await expect(
      refreshToken.execute({ refreshToken: 'bad-token' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid refresh token'));
  });

  it('should deactivate session when refresh token is expired', async () => {
    const session = buildSession({
      id: 'session-id',
      expiresAt: new Date(Date.now() - 1000),
      isActive: true,
    });
    sessionRepository.findByRefreshToken.mockResolvedValue(session);

    await expect(
      refreshToken.execute({ refreshToken: 'expired-token' }),
    ).rejects.toThrow(new UnauthorizedException('Refresh token expired'));

    expect(sessionRepository.deactivateSession).toHaveBeenCalledWith(
      session.id,
    );
  });

  it('should throw when session is no longer active', async () => {
    const session = buildSession({
      id: 'session-id',
      expiresAt: new Date(Date.now() + 1000),
      isActive: false,
    });
    sessionRepository.findByRefreshToken.mockResolvedValue(session);

    await expect(
      refreshToken.execute({ refreshToken: 'inactive-token' }),
    ).rejects.toThrow(new UnauthorizedException('Session is no longer active'));
  });

  it('should refresh access token', async () => {
    const session = buildSession({
      id: 'session-id',
      userId: 'user-id',
      expiresAt: new Date(Date.now() + 1000),
      isActive: true,
      user: { email: 'user@example.com' } as User,
    });
    sessionRepository.findByRefreshToken.mockResolvedValue(session);
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await refreshToken.execute({ refreshToken: 'good-token' });

    expect(sessionRepository.updateLastUsed).toHaveBeenCalledWith(session.id);
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: session.userId, email: session.user.email, sessionId: session.id },
      { expiresIn: `${TOKEN_EXPIRATION.ACCESS_TOKEN}h` },
    );
    expect(result).toEqual({ accessToken: 'access-token' });
  });
});
