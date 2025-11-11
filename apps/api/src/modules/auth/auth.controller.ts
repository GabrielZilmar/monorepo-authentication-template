import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  RegisterUserDTO,
  LoginDTO,
  AuthResponseDTO,
  LoginResponseDTO,
} from '@repo/api';
import { LocalAuthGuard } from '~/modules/auth/guards/local-auth.guard';
import Login from '~/modules/auth/use-cases/login';
import RegisterUser from '~/modules/auth/use-cases/register';
import { RequestWithUser } from '~/types/request-with-user';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUseCase: Login,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterUserDTO,
  ): Promise<AuthResponseDTO> {
    return this.registerUser.execute(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDTO): Promise<LoginResponseDTO> {
    return this.loginUseCase.execute(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }
}
