import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RegisterUserDTO, LoginDto, AuthResponseDTO, UserDTO } from '@repo/api';
import { AuthService } from '~/modules/auth/auth.service';
import { LocalAuthGuard } from '~/modules/auth/guards/local-auth.guard';
import RegisterUser from '~/modules/auth/use-cases/register';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerUser: RegisterUser,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterUserDTO,
  ): Promise<AuthResponseDTO> {
    return this.registerUser.execute(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDTO> {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
