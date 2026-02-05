import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  RegisterUserDTO,
  LoginDTO,
  AuthResponseDTO,
  LoginResponseDTO,
  VerifyEmailParamsDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  RefreshTokenDTO,
  RefreshTokenResponseDTO,
} from '@repo/api';
import { LocalAuthGuard } from '~/modules/auth/guards/local-auth.guard';
import Login from '~/modules/auth/use-cases/login';
import RegisterUser from '~/modules/auth/use-cases/register';
import SendVerificationEmail from '~/modules/auth/use-cases/send-verification-email';
import VerifyEmail from '~/modules/auth/use-cases/verify-email';
import ForgotPassword from '~/modules/auth/use-cases/forgot-password';
import ResetPassword from '~/modules/auth/use-cases/reset-password';
import RefreshToken from '~/modules/auth/use-cases/refresh-token';
import Logout from '~/modules/auth/use-cases/logout';
import { RequestWithUser } from '~/types/request-with-user';
import { Request } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUseCase: Login,
    private readonly sendVerificationEmail: SendVerificationEmail,
    private readonly verifyEmailUseCase: VerifyEmail,
    private readonly forgotPasswordUseCase: ForgotPassword,
    private readonly resetPasswordUseCase: ResetPassword,
    private readonly refreshTokenUseCase: RefreshToken,
    private readonly logoutUseCase: Logout,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterUserDTO,
  ): Promise<AuthResponseDTO> {
    return this.registerUser.execute(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDTO,
    @Req() req: Request,
  ): Promise<LoginResponseDTO> {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    return this.loginUseCase.execute({
      ...loginDto,
      userAgent,
      ipAddress,
    });
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDTO,
  ): Promise<RefreshTokenResponseDTO> {
    return this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req: RequestWithUser) {
    await this.logoutUseCase.execute({ sessionId: req.user.sessionId });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    const { sessionId: _sessionId, ...user } = req.user;
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('send-verification-email')
  async resendVerificationEmail(@Req() req: RequestWithUser) {
    await this.sendVerificationEmail.execute(req.user.id);
  }

  @Post('verify-email')
  async verifyEmail(@Query() { token }: VerifyEmailParamsDTO) {
    return this.verifyEmailUseCase.execute(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    await this.forgotPasswordUseCase.execute(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    await this.resetPasswordUseCase.execute(resetPasswordDto);
  }
}
