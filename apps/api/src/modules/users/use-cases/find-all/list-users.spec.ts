import 'reflect-metadata';

import { describe, it, expect, beforeEach } from '@jest/globals';
import { UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import ListUsers from './index';
import { buildUser } from 'test/test-utils/factories';

describe('ListUsers Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let listUsers: ListUsers;

  beforeEach(() => {
    userRepository = {
      find: jest.fn(),
      genericMountSearch: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    listUsers = new ListUsers(userRepository);
  });

  it('should return a paginated list of users', async () => {
    const user = buildUser();
    userRepository.genericMountSearch.mockReturnValue({ email: user.email });
    userRepository.find.mockResolvedValue({ items: [user], count: 1 });

    const result = await listUsers.execute({
      skip: 0,
      take: 10,
      email: user.email,
      username: user.username,
    });

    expect(userRepository.genericMountSearch).toHaveBeenCalledWith({
      email: user.email,
      username: user.username,
    });
    expect(userRepository.find).toHaveBeenCalledWith({
      where: { email: user.email },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      items: [UserMapper.toDto(user)],
      count: 1,
    });
  });
});
