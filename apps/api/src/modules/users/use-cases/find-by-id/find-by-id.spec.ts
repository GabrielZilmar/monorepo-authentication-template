import { describe, it, expect, beforeEach } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import FindUserById from './index';
import { buildUser } from 'test/test-utils/factories';

describe('FindUserById Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let findUserById: FindUserById;

  beforeEach(() => {
    userRepository = {
      findOneById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    findUserById = new FindUserById(userRepository);
  });

  it('should throw when user is not found', async () => {
    userRepository.findOneById.mockResolvedValue(null);

    await expect(findUserById.execute({ id: 'missing-id' })).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });

  it('should return a user dto when found', async () => {
    const user = buildUser();
    userRepository.findOneById.mockResolvedValue(user);

    const result = await findUserById.execute({ id: user.id });

    expect(result).toEqual(UserMapper.toDto(user));
  });
});
