import { Injectable, NotFoundException } from '@nestjs/common';
import { UserDTO, UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';
import { UserRequest } from '~/types/user-request.type';

export type GetMeParams = UserRequest;
type GetMeResponse = UserDTO;

@Injectable()
export default class GetMe implements UseCase<GetMeParams, GetMeResponse> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ userId }: UserRequest): Promise<GetMeResponse> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserMapper.toDto(user);
  }
}
