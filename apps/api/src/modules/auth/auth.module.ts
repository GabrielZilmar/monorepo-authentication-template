import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '~/modules/auth/auth.controller';
import { AuthService } from '~/modules/auth/auth.service';
import { JwtStrategy } from '~/modules/auth/strategies/jwt.strategy';
import { LocalStrategy } from '~/modules/auth/strategies/local.strategy';
import { UsersModule } from '~/modules/users/users.module';
import { UsersService } from '~/modules/users/users.service';
import Env from '~/shared/env';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: Env.jwtSecret,
      signOptions: { expiresIn: '24h' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtService],
})
export class AuthModule {}
