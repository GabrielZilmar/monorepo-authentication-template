import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginatedDTO } from '../../shared/paginated';

export class ListUsersQueryDTO extends PaginatedDTO {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  email?: string;
}
