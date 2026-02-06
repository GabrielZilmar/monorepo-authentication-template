import { describe, it, expect, beforeEach } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import UpdateUser from './index';
import { buildUser } from 'test/test-utils/factories';

describe('UpdateUser Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let updateUser: UpdateUser;

  beforeEach(() => {
    userRepository = {
      updateAndReturn: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    updateUser = new UpdateUser(userRepository);
  });

  it('should throw when user is not admin and not updating self', async () => {
    await expect(
      updateUser.execute({
        id: 'target-id',
        currentUser: buildUser({ id: 'current-id', isAdmin: false }),
        username: 'new-name',
      }),
    ).rejects.toThrow(
      new ForbiddenException('You can only edit your own account information'),
    );
  });

  it('should update user when updating self', async () => {
    const user = buildUser({ id: 'user-id', username: 'old' });
    const updated = buildUser({ id: 'user-id', username: 'new-name' });
    userRepository.updateAndReturn.mockResolvedValue(updated);

    const result = await updateUser.execute({
      id: user.id,
      currentUser: user,
      username: 'new-name',
    });

    expect(userRepository.updateAndReturn).toHaveBeenCalledWith(user.id, {
      username: 'new-name',
    });
    expect(result).toEqual(UserMapper.toDto(updated));
  });

  it('should update user when current user is admin', async () => {
    const updated = buildUser({ id: 'target-id', username: 'admin-update' });
    userRepository.updateAndReturn.mockResolvedValue(updated);

    const result = await updateUser.execute({
      id: 'target-id',
      currentUser: buildUser({ id: 'admin-id', isAdmin: true }),
      username: 'admin-update',
    });

    expect(result).toEqual(UserMapper.toDto(updated));
  });
});
