import { IsString, IsUUID } from 'class-validator';

export class DeleteUserParamsDTO {
  @IsString()
  @IsUUID()
  id: string;
}
