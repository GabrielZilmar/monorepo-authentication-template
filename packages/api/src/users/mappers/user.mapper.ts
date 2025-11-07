import { User } from '../entities/user.entity';
import { UserDTO } from '../dto/user.dto';

export class UserMapper {
  static toDto(user: User): UserDTO {
    return new UserDTO(
      user.id,
      user.email,
      user.username,
      user.createdAt,
      user.updatedAt,
    );
  }
}
