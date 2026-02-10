import { describe, it, expect, beforeEach } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import GenerateForgotPasswordToken from './index';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';

jest.mock('~/services/database/typeorm/repositories/token.repository');

describe('GenerateForgotPasswordToken Use Case', () => {
  let dataSource: DataSource;
  let tokenRepository: {
    findValidToken: jest.Mock;
    invalidateAllUserTokens: jest.Mock;
    createToken: jest.Mock;
  };
  let generateToken: GenerateForgotPasswordToken;

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

    generateToken = new GenerateForgotPasswordToken(dataSource);
  });

  it('should throw when a valid token already exists', async () => {
    tokenRepository.findValidToken.mockResolvedValue({ id: 'token-id' });

    await expect(generateToken.execute('user-id')).rejects.toThrow(
      new BadRequestException(
        `Please wait  ${Math.floor(TOKEN_EXPIRATION.PASSWORD_RESET * 60)} minutes before requesting a new password reset email`,
      ),
    );
  });

  it('should create a new password reset token', async () => {
    tokenRepository.findValidToken.mockResolvedValue(null);
    tokenRepository.createToken.mockResolvedValue({ plainToken: 'plain-token' });

    const result = await generateToken.execute('user-id');

    expect(tokenRepository.invalidateAllUserTokens).toHaveBeenCalledWith(
      'user-id',
      TokenType.PASSWORD_RESET,
    );
    expect(tokenRepository.createToken).toHaveBeenCalledWith(
      'user-id',
      TokenType.PASSWORD_RESET,
      TOKEN_EXPIRATION.PASSWORD_RESET,
    );
    expect(result).toBe('plain-token');
  });
});
