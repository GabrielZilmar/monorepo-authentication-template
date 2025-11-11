import { ForbiddenException, Injectable } from '@nestjs/common';
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
    return this.userRepository.delete(id);
  }
}
