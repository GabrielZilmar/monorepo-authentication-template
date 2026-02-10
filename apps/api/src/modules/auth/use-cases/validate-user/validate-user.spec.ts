import 'reflect-metadata';

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import PasswordUtils from '~/shared/password.util';
import ValidateUser from './index';
import { buildUser } from 'test/test-utils/factories';

describe('ValidateUser Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let validateUser: ValidateUser;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    validateUser = new ValidateUser(userRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return null when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await validateUser.execute({
      email: 'missing@example.com',
      password: 'secret',
    });

    expect(result).toBeNull();
  });

  it('should return null when password is invalid', async () => {
    const user = buildUser({ email: 'user@example.com', password: 'hashed' });
    userRepository.findByEmail.mockResolvedValue(user);
    jest.spyOn(PasswordUtils, 'compare').mockResolvedValue(false);

    const result = await validateUser.execute({
      email: user.email,
      password: 'wrong',
    });

    expect(result).toBeNull();
  });

  it('should return user dto when valid', async () => {
    const user = buildUser({ email: 'user@example.com', password: 'hashed' });
    userRepository.findByEmail.mockResolvedValue(user);
    jest.spyOn(PasswordUtils, 'compare').mockResolvedValue(true);

    const result = await validateUser.execute({
      email: user.email,
      password: 'valid',
    });

    expect(result).toEqual(UserMapper.toDto(user));
  });
});
