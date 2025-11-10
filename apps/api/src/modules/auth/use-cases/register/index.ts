import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDTO, RegisterUserDTO, UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type RegisterUserParams = RegisterUserDTO;
type RegisterUserResult = AuthResponseDTO;

@Injectable()
export default class RegisterUser
  implements UseCase<RegisterUserParams, RegisterUserResult>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    email,
    password,
    username,
  }: RegisterUserParams): Promise<RegisterUserResult> {
    const user = await this.userRepository.create({
      email,
      password,
      username,
    });
    const userDTO = UserMapper.toDto(user);

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: userDTO,
      accessToken,
    };
  }
}
