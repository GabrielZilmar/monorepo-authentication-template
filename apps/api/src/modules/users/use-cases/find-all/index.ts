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
    page = 1,
    perPage = 10,
    ...query
  }: ListUsersParams): Promise<ListUsersResult> {
    const skip = Math.max(page - 1, 0) * perPage;
    const { items, count } = await this.userRepository.find({
      where: {
        ...this.userRepository.genericMountSearch(query),
      },
      skip,
      take: perPage,
    });
    return {
      items: items.map(UserMapper.toDto),
      count,
    };
  }
}
