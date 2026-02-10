import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserParamsDTO {
  @IsString()
  @IsUUID()
  id: string;
}

export class UpdateUserBodyDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;
}
