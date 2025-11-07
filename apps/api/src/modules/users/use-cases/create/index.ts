import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserDTO, UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type CreateUserParams = CreateUserDto;
type CreateUserResult = UserDTO;

@Injectable()
export default class CreateUser
  implements UseCase<CreateUserParams, CreateUserResult>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(params: CreateUserParams): Promise<CreateUserResult> {
    const user = await this.userRepository.create(params);
    return UserMapper.toDto(user);
  }
}
