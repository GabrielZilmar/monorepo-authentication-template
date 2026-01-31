import { IsString } from 'class-validator';

export class VerifyEmailParamsDTO {
  @IsString()
  token: string;
}
