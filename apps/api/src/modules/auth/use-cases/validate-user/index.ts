import { Injectable } from '@nestjs/common';
import { LoginDTO, UserDTO, UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';
import PasswordUtils from '~/shared/password.util';

export type ValidateUserParams = LoginDTO;
type ValidateUserResponse = UserDTO;

@Injectable()
export default class ValidateUser
  implements UseCase<ValidateUserParams, ValidateUserResponse>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ email, password }: LoginDTO): Promise<ValidateUserResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await PasswordUtils.compare({
      password,
      passwordHashed: user.password,
    });
    if (!isPasswordValid) {
      return null;
    }

    return UserMapper.toDto(user);
  }
}
