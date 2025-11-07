import { Injectable, NotFoundException } from '@nestjs/common';
import { FindUserByIdParamsDTO, User, UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type FindUserByIdParams = FindUserByIdParamsDTO;
type FindUserByIdResult = User;

@Injectable()
export default class FindUserById
  implements UseCase<FindUserByIdParams, FindUserByIdResult>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ id }: FindUserByIdParams): Promise<FindUserByIdResult> {
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserMapper.toDto(user);
  }
}
