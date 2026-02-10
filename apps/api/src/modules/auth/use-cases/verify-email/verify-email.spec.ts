import { describe, it, expect, beforeEach } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import VerifyEmail from './index';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import CryptoUtils from '~/shared/crypto.util';
import { buildToken, buildUser } from 'test/test-utils/factories';

jest.mock('~/services/database/typeorm/repositories/token.repository');

describe('VerifyEmail Use Case', () => {
  let dataSource: DataSource;
  let tokenRepository: {
    findByHashedToken: jest.Mock;
    markAsUsed: jest.Mock;
  };
  let userRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let verifyEmail: VerifyEmail;

  beforeEach(() => {
    tokenRepository = {
      findByHashedToken: jest.fn(),
      markAsUsed: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    (TokenRepository as jest.Mock).mockImplementation(() => tokenRepository);

    const manager = {
      getRepository: jest.fn().mockReturnValue(userRepository),
    };

    dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    } as unknown as DataSource;

    verifyEmail = new VerifyEmail(dataSource);
  });

  it('should throw when token is invalid', async () => {
    tokenRepository.findByHashedToken.mockResolvedValue(null);

    await expect(verifyEmail.execute('plain')).rejects.toThrow(
      new NotFoundException('Invalid or expired verification token'),
    );

    expect(tokenRepository.findByHashedToken).toHaveBeenCalledWith(
      CryptoUtils.hashToken('plain'),
      TokenType.EMAIL_VERIFICATION,
    );
  });

  it('should throw when token is expired', async () => {
    const tokenEntity = buildToken({
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() - 1000),
      used: false,
    });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);

    await expect(verifyEmail.execute('plain')).rejects.toThrow(
      new BadRequestException('Verification token has expired'),
    );
  });

  it('should throw when token is already used', async () => {
    const tokenEntity = buildToken({
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 1000),
      used: true,
    });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);

    await expect(verifyEmail.execute('plain')).rejects.toThrow(
      new BadRequestException('Verification token has already been used'),
    );
  });

  it('should throw when user is not found', async () => {
    const tokenEntity = buildToken({
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 1000),
      used: false,
    });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);
    userRepository.findOne.mockResolvedValue(null);

    await expect(verifyEmail.execute('plain')).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });

  it('should throw when email is already verified', async () => {
    const tokenEntity = buildToken({
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 1000),
      used: false,
    });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);
    userRepository.findOne.mockResolvedValue(
      buildUser({ id: tokenEntity.userId, emailVerified: true }),
    );

    await expect(verifyEmail.execute('plain')).rejects.toThrow(
      new BadRequestException('Email is already verified'),
    );
  });

  it('should verify email and mark token used', async () => {
    const tokenEntity = buildToken({
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 1000),
      used: false,
      userId: 'user-id',
    });
    const user = buildUser({ id: 'user-id', emailVerified: false });
    tokenRepository.findByHashedToken.mockResolvedValue(tokenEntity);
    userRepository.findOne.mockResolvedValue(user);

    await verifyEmail.execute('plain');

    expect(user.emailVerified).toBe(true);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(tokenRepository.markAsUsed).toHaveBeenCalledWith(tokenEntity.id);
  });
});
