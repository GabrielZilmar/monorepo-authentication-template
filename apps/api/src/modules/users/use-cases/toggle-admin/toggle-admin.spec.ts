import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import ToggleAdmin from './index';
import { buildUser } from 'test/test-utils/factories';

describe('ToggleAdmin Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let toggleAdmin: ToggleAdmin;

  beforeEach(() => {
    userRepository = {
      findOneById: jest.fn(),
      updateAndReturn: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    toggleAdmin = new ToggleAdmin(userRepository);
  });

  it('should throw when user is not found', async () => {
    userRepository.findOneById.mockResolvedValue(null);

    await expect(
      toggleAdmin.execute({
        id: 'missing-id',
        currentUser: buildUser({ isAdmin: true }),
      }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('should throw when current user is not admin', async () => {
    const user = buildUser({ id: 'target-id' });
    userRepository.findOneById.mockResolvedValue(user);

    await expect(
      toggleAdmin.execute({
        id: user.id,
        currentUser: buildUser({ isAdmin: false }),
      }),
    ).rejects.toThrow(
      new ForbiddenException("You don't have permission to execute this action"),
    );
  });

  it('should throw when current user tries to toggle self', async () => {
    const currentUser = buildUser({ id: 'user-id', isAdmin: true });
    userRepository.findOneById.mockResolvedValue(currentUser);

    await expect(
      toggleAdmin.execute({
        id: currentUser.id,
        currentUser,
      }),
    ).rejects.toThrow(
      new BadRequestException("You can't toggle your own admin settings"),
    );
  });

  it('should toggle admin status', async () => {
    const user = buildUser({ id: 'target-id', isAdmin: false });
    const updatedUser = buildUser({ id: 'target-id', isAdmin: true });
    userRepository.findOneById.mockResolvedValue(user);
    userRepository.updateAndReturn.mockResolvedValue(updatedUser);

    const result = await toggleAdmin.execute({
      id: user.id,
      currentUser: buildUser({ id: 'admin-id', isAdmin: true }),
    });

    expect(userRepository.updateAndReturn).toHaveBeenCalledWith(user.id, {
      isAdmin: true,
    });
    expect(result).toEqual(UserMapper.toDto(updatedUser));
  });
});
