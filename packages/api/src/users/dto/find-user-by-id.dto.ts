import { IsString, IsUUID } from 'class-validator';

export class FindUserByIdParamsDTO {
  @IsString()
  @IsUUID()
  id: string;
}
