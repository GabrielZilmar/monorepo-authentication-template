import { IsString, IsUUID } from 'class-validator';

export class ToggleAdminParamsDTO {
  @IsString()
  @IsUUID()
  id: string;
}
