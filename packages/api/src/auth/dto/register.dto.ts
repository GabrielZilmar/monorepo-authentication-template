import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @IsString()
  @ValidateIf((o) => o.password !== o.repeatPassword)
  passwordConfirm: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
