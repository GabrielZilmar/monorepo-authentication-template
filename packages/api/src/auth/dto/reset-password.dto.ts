import { IsString, IsStrongPassword } from 'class-validator';
import { Match } from '../../decorators/match.decorator';

export class ResetPasswordDTO {
  @IsString()
  token: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  passwordConfirm: string;
}
