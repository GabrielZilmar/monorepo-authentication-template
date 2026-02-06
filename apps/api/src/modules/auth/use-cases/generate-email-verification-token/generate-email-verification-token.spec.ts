import { describe, it, expect, beforeEach } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import GenerateEmailVerificationToken from './index';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';

jest.mock('~/services/database/typeorm/repositories/token.repository');

describe('GenerateEmailVerificationToken Use Case', () => {
  let dataSource: DataSource;
  let tokenRepository: {
    findValidToken: jest.Mock;
    invalidateAllUserTokens: jest.Mock;
    createToken: jest.Mock;
  };
  let generateToken: GenerateEmailVerificationToken;

  beforeEach(() => {
    tokenRepository = {
      findValidToken: jest.fn(),
      invalidateAllUserTokens: jest.fn(),
      createToken: jest.fn(),
    };

    (TokenRepository as jest.Mock).mockImplementation(() => tokenRepository);

    dataSource = {
      transaction: jest.fn((callback) => callback({})),
    } as unknown as DataSource;

    generateToken = new GenerateEmailVerificationToken(dataSource);
  });

  it('should throw when a valid token already exists', async () => {
    tokenRepository.findValidToken.mockResolvedValue({ id: 'token-id' });

    await expect(generateToken.execute('user-id')).rejects.toThrow(
      new BadRequestException(
        `Please wait ${TOKEN_EXPIRATION.EMAIL_VERIFICATION * 60} minutes before requesting a new verification email`,
      ),
    );
  });

  it('should create a new verification token', async () => {
    tokenRepository.findValidToken.mockResolvedValue(null);
    tokenRepository.createToken.mockResolvedValue({ plainToken: 'plain-token' });

    const result = await generateToken.execute('user-id');

    expect(tokenRepository.invalidateAllUserTokens).toHaveBeenCalledWith(
      'user-id',
      TokenType.EMAIL_VERIFICATION,
    );
    expect(tokenRepository.createToken).toHaveBeenCalledWith(
      'user-id',
      TokenType.EMAIL_VERIFICATION,
      TOKEN_EXPIRATION.EMAIL_VERIFICATION,
    );
    expect(result).toBe('plain-token');
  });
});
