import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  UpdateUserParamsDTO,
  UpdateUserBodyDTO,
  User,
  UserMapper,
} from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type UpdateUserParams = UpdateUserParamsDTO & UpdateUserBodyDTO; // & { currentUser: User };
type UpdateUserResult = User;

@Injectable()
export default class UpdateUser
  implements UseCase<UpdateUserParams, UpdateUserResult>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    // currentUser,
    id,
    ...body
  }: UpdateUserParams): Promise<UpdateUserResult> {
    // const isSameUser = currentUser.id === id;
    // // TODO: Or currentUser is admin
    // if (!isSameUser) {
    //   throw new ForbiddenException(
    //     'You can only edit your own account information',
    //   );
    // }
    const updatedUser = await this.userRepository.updateAndReturn(id, body);
    return UserMapper.toDto(updatedUser);
  }
}
