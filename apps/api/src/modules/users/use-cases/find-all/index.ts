import { Injectable } from '@nestjs/common';
import { UserDTO, UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type ListUsersResult = UserDTO[];

// TODO: Add pagination and search criteria
@Injectable()
export default class ListUsers implements UseCase<void, ListUsersResult> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<ListUsersResult> {
    const { items: users } = await this.userRepository.findAll();
    return users.map(UserMapper.toDto);
  }
}
