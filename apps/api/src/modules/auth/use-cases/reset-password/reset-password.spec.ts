import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import PasswordUtils from '~/shared/password.util';
import CryptoUtils from '~/shared/crypto.util';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import ResetPassword from './index';
import { buildToken, buildUser } from 'test/test-utils/factories';

jest.mock('~/services/database/typeorm/repositories/token.repository');
jest.mock('~/services/database/typeorm/repositories/session.repository');

describe('ResetPassword Use Case', () => {
  let dataSource: DataSource;
  let tokenRepository: {
    findByHashedToken: jest.Mock;
    markAsUsed: jest.Mock;
  };
  let sessionRepository: {
    deactivateAllUserSessions: jest.Mock;
  };
  let userRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let resetPassword: ResetPassword;

  beforeEach(() => {
    tokenRepository = {
      findByHashedToken: jest.fn(),
      markAsUsed: jest.fn(),
    };
    sessionRepository = {
      deactivateAllUserSessions: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    (TokenRepository as jest.Mock).mockImplementation(() => tokenRepository);
    (SessionRepository as jest.Mock).mockImplementation(() => sessionRepository);

    const manager = {
      getRepository: jest.fn().mockReturnValue(userRepository),
    };

    dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    } as unknown as DataSource;

    resetPassword = new ResetPassword(dataSource);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw when reset token is not found', async () => {
    tokenRepository.findByHashedToken.mockResolvedValue(null);

    await expect(
      resetPassword.execute({ token: 'plain', password: 'new-pass' }),
    ).rejects.toThrow(
      new NotFoundException('Invalid or expired reset token'),
    );

    expect(tokenRepository.findByHashedToken).toHaveBeenCalledWith(
      CryptoUtils.hashToken('plain'),
      TokenType.PASSWORD_RESET,
    );
  });

  it('should throw when reset token is expired', async () => {
    const tokenEntity = buildToken({
      type: TokenType.PASSWORD_RESET,
      expiresAt: new Date(Date.now() - 1000),
      used: false,
    });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);

    await expect(
      resetPassword.execute({ token: 'plain', password: 'new-pass' }),
    ).rejects.toThrow(new BadRequestException('Reset token has expired'));
  });

  it('should throw when reset token has been used', async () => {
    const tokenEntity = buildToken({
      type: TokenType.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + 1000),
      used: true,
    });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);

    await expect(
      resetPassword.execute({ token: 'plain', password: 'new-pass' }),
    ).rejects.toThrow(new BadRequestException('Reset token has already been used'));
  });

  it('should throw when user is not found', async () => {
    const tokenEntity = buildToken({
      type: TokenType.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + 1000),
      used: false,
    });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      resetPassword.execute({ token: 'plain', password: 'new-pass' }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('should reset password and invalidate sessions', async () => {
    const tokenEntity = buildToken({
      type: TokenType.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + 1000),
      used: false,
      userId: 'user-id',
    });
    const user = buildUser({ id: 'user-id', password: 'old', passwordSalt: 'old' });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);
    userRepository.findOne.mockResolvedValue(user);
    jest.spyOn(PasswordUtils, 'encrypt').mockResolvedValue({
      passwordHash: 'new-hash',
      passwordSalt: 'new-salt',
    });

    await resetPassword.execute({ token: 'plain', password: 'new-pass' });

    expect(user.password).toBe('new-hash');
    expect(user.passwordSalt).toBe('new-salt');
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(tokenRepository.markAsUsed).toHaveBeenCalledWith(tokenEntity.id);
    expect(sessionRepository.deactivateAllUserSessions).toHaveBeenCalledWith(
      user.id,
    );
  });
});
