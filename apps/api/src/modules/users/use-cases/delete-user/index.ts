import { Injectable } from '@nestjs/common';
import { DeleteUserParamsDTO } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type DeleteUserParams = DeleteUserParamsDTO;
type DeleteUserResult = boolean;

@Injectable()
export default class DeleteUser
  implements UseCase<DeleteUserParams, DeleteUserResult>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ id }: DeleteUserParams): Promise<DeleteUserResult> {
    // TODO: Check id is the same of the currentUser or currentUser is admin
    return this.userRepository.delete(id);
  }
}
