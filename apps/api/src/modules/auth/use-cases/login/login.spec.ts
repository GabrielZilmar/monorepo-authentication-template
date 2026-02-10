import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import PasswordUtils from '~/shared/password.util';
import Login from './index';
import { buildSession, buildUser } from 'test/test-utils/factories';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';

describe('Login Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let login: Login;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    sessionRepository = {
      createSession: jest.fn(),
    } as unknown as jest.Mocked<SessionRepository>;
    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    login = new Login(jwtService, userRepository, sessionRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      login.execute({ email: 'missing@example.com', password: 'secret' }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('should throw when password is invalid', async () => {
    const user = buildUser({ email: 'user@example.com', password: 'hashed' });
    userRepository.findByEmail.mockResolvedValue(user);
    jest.spyOn(PasswordUtils, 'compare').mockResolvedValue(false);

    await expect(
      login.execute({ email: user.email, password: 'wrong' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
  });

  it('should return tokens on success', async () => {
    const user = buildUser({ email: 'user@example.com', password: 'hashed' });
    const session = buildSession({ id: 'session-id', userId: user.id });
    userRepository.findByEmail.mockResolvedValue(user);
    jest.spyOn(PasswordUtils, 'compare').mockResolvedValue(true);
    sessionRepository.createSession.mockResolvedValue({
      refreshToken: 'refresh-token',
      session,
    });
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await login.execute({
      email: user.email,
      password: 'valid',
      userAgent: 'agent',
      ipAddress: '127.0.0.1',
    });

    expect(sessionRepository.createSession).toHaveBeenCalledWith(
      user.id,
      TOKEN_EXPIRATION.REFRESH_TOKEN,
      { userAgent: 'agent', ipAddress: '127.0.0.1' },
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: user.id, email: user.email, sessionId: session.id },
      { expiresIn: `${TOKEN_EXPIRATION.ACCESS_TOKEN}h` },
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });
});
