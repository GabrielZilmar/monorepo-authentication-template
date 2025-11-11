import { UserEntity } from '../entities/user.entity';
import { UserDTO } from '../dto/user.dto';

export class UserMapper {
  static toDto(user: UserEntity): UserDTO {
    return new UserDTO(
      user.id,
      user.email,
      user.username,
      user.isAdmin,
      user.createdAt,
      user.updatedAt,
    );
  }
}
