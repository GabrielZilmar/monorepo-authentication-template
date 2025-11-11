import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DeleteUserParamsDTO, UserDTO } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type DeleteUserParams = DeleteUserParamsDTO & { currentUser: UserDTO };
type DeleteUserResult = boolean;

@Injectable()
export default class DeleteUser
  implements UseCase<DeleteUserParams, DeleteUserResult>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    id,
    currentUser,
  }: DeleteUserParams): Promise<DeleteUserResult> {
    const isSameUser = currentUser.id === id;
    if (!isSameUser && !currentUser.isAdmin) {
      throw new ForbiddenException(
        'You can only edit your own account information',
      );
    }

    if (isSameUser && currentUser.isAdmin) {
      const remainingAdminsCount = await this.userRepository.countAdmins();
      const isOnlyAdmin = remainingAdminsCount === 1;
      if (isOnlyAdmin) {
        throw new BadRequestException(
          'Unable to delete the last remaining admin user.',
        );
      }
    }

    return this.userRepository.delete(id);
  }
}
