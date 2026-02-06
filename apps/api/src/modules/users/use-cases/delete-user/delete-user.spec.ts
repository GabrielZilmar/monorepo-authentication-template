import { describe, it, expect, beforeEach } from '@jest/globals';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import DeleteUser from './index';
import { buildUser } from 'test/test-utils/factories';

describe('DeleteUser Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let deleteUser: DeleteUser;

  beforeEach(() => {
    userRepository = {
      delete: jest.fn(),
      countAdmins: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    deleteUser = new DeleteUser(userRepository);
  });

  it('should throw when user is not admin and not deleting self', async () => {
    await expect(
      deleteUser.execute({
        id: 'target-id',
        currentUser: buildUser({ id: 'current-id', isAdmin: false }),
      }),
    ).rejects.toThrow(
      new ForbiddenException('You can only edit your own account information'),
    );
  });

  it('should throw when deleting the last remaining admin', async () => {
    const currentUser = buildUser({ id: 'admin-id', isAdmin: true });
    userRepository.countAdmins.mockResolvedValue(1);

    await expect(
      deleteUser.execute({
        id: currentUser.id,
        currentUser,
      }),
    ).rejects.toThrow(
      new BadRequestException('Unable to delete the last remaining admin user.'),
    );
  });

  it('should delete when admin has another admin remaining', async () => {
    const currentUser = buildUser({ id: 'admin-id', isAdmin: true });
    userRepository.countAdmins.mockResolvedValue(2);
    userRepository.delete.mockResolvedValue(true as never);

    const result = await deleteUser.execute({
      id: currentUser.id,
      currentUser,
    });

    expect(userRepository.delete).toHaveBeenCalledWith(currentUser.id);
    expect(result).toBe(true);
  });

  it('should delete when current user is admin deleting another user', async () => {
    const currentUser = buildUser({ id: 'admin-id', isAdmin: true });
    userRepository.delete.mockResolvedValue(true as never);

    const result = await deleteUser.execute({
      id: 'target-id',
      currentUser,
    });

    expect(userRepository.delete).toHaveBeenCalledWith('target-id');
    expect(result).toBe(true);
  });
});
