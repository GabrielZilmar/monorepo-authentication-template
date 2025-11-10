import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  RegisterUserDTO,
  LoginDTO,
  AuthResponseDTO,
  UserDTO,
  LoginResponseDTO,
} from '@repo/api';
import { LocalAuthGuard } from '~/modules/auth/guards/local-auth.guard';
import GetMe from '~/modules/auth/use-cases/get-me';
import Login from '~/modules/auth/use-cases/login';
import RegisterUser from '~/modules/auth/use-cases/register';
import { RequestWithUser } from '~/types/request-with-user';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUseCase: Login,
    private readonly getMeUseCase: GetMe,
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
  getMe(@Req() req: RequestWithUser): Promise<UserDTO> {
    return this.getMeUseCase.execute(req.user);
  }
}
