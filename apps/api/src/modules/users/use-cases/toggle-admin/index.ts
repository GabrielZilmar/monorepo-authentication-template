import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ToggleAdminParamsDTO, UserDTO, UserMapper } from '@repo/api';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { UseCase } from '~/shared/core/use-case';

type ToggleAdminParams = ToggleAdminParamsDTO & { currentUser: UserDTO };
type ToggleAdminResult = UserDTO;

@Injectable()
export default class ToggleAdmin
  implements UseCase<ToggleAdminParams, ToggleAdminResult>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ id, currentUser }: ToggleAdminParams): Promise<UserDTO> {
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!currentUser.isAdmin) {
      throw new ForbiddenException(
        "You don't have permission to execute this action",
      );
    }
    if (currentUser.id === id) {
      throw new BadRequestException("You can't toggle your own admin settings");
    }

    const updatedUser = await this.userRepository.updateAndReturn(id, {
      isAdmin: !user.isAdmin,
    });
    return UserMapper.toDto(updatedUser);
  }
}
