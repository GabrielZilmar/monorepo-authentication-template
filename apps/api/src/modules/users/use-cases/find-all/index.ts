import { Injectable } from '@nestjs/common';
import {
  ListUsersQueryDTO,
  PaginatedResultDTO,
  UserDTO,
  UserMapper,
} from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type ListUsersParams = ListUsersQueryDTO;
export type ListUsersResult = PaginatedResultDTO<UserDTO>;

@Injectable()
export default class ListUsers
  implements UseCase<ListUsersQueryDTO, ListUsersResult>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    skip,
    take,
    ...query
  }: ListUsersParams): Promise<ListUsersResult> {
    const { items, count } = await this.userRepository.find({
      where: {
        ...this.userRepository.genericMountSearch(query),
      },
      skip,
      take,
    });
    return {
      items: items.map(UserMapper.toDto),
      count,
    };
  }
}
