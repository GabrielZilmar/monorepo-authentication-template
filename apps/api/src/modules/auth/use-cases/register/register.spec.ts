import 'reflect-metadata';

import { describe, it, expect, beforeEach } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import SendVerificationEmail from '~/modules/auth/use-cases/send-verification-email';
import RegisterUser from './index';
import { buildUser } from 'test/test-utils/factories';

describe('RegisterUser Use Case', () => {
  let logger: jest.Mocked<Logger>;
  let jwtService: jest.Mocked<JwtService>;
  let userRepository: jest.Mocked<UserRepository>;
  let sendVerificationEmail: jest.Mocked<SendVerificationEmail>;
  let registerUser: RegisterUser;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;
    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;
    userRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    sendVerificationEmail = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SendVerificationEmail>;

    registerUser = new RegisterUser(
      logger,
      jwtService,
      userRepository,
      sendVerificationEmail,
    );
  });

  it('should register user and return auth response', async () => {
    const user = buildUser({ id: 'new-id', email: 'new@example.com' });
    userRepository.create.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('access-token');
    sendVerificationEmail.execute.mockResolvedValue(undefined);

    const result = await registerUser.execute({
      email: user.email,
      password: 'secret',
      username: user.username,
    });

    expect(result).toEqual({
      user: UserMapper.toDto(user),
      accessToken: 'access-token',
    });
  });

  it('should log error when verification email fails', async () => {
    const user = buildUser({ id: 'new-id', email: 'new@example.com' });
    const error = new Error('send failed');
    userRepository.create.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('access-token');
    sendVerificationEmail.execute.mockRejectedValue(error);

    await registerUser.execute({
      email: user.email,
      password: 'secret',
      username: user.username,
    });

    await new Promise(process.nextTick);

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to send verification email:',
      error,
    );
  });
});
