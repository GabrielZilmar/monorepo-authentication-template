import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '~/modules/auth/auth.controller';
import { JwtStrategy } from '~/modules/auth/strategies/jwt.strategy';
import { LocalStrategy } from '~/modules/auth/strategies/local.strategy';
import authUseCasesProviders from '~/modules/auth/use-cases/provider';
import { UsersModule } from '~/modules/users/users.module';
import { User } from '~/modules/users/entities/user.entity';
import { Session } from '~/modules/auth/entities/session.entity';
import { EmailModule } from '~/modules/email/email.module';
import { TokensModule } from '~/modules/tokens/tokens.module';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';
import Env from '~/shared/env';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: Env.jwtSecret,
      signOptions: { expiresIn: `${TOKEN_EXPIRATION.ACCESS_TOKEN}h` },
    }),
    TypeOrmModule.forFeature([User, Session]),
    UsersModule,
    EmailModule,
    TokensModule,
  ],
  controllers: [AuthController],
  providers: [LocalStrategy, JwtStrategy, ...authUseCasesProviders],
  exports: [...authUseCasesProviders],
})
export class AuthModule {}
