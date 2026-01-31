import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '~/modules/auth/auth.controller';
import { AuthModule } from '~/modules/auth/auth.module';
import { DatabaseModule } from '~/modules/database/database.module';
import { EmailModule } from '~/modules/email/email.module';
import { TokensModule } from '~/modules/tokens/tokens.module';
import { UsersController } from '~/modules/users/users.controller';
import { UsersModule } from '~/modules/users/users.module';
import repositoriesProviders from '~/services/database/typeorm/repositories/providers';
import { MailSender } from '~/services/email/mailsender';

const allProviders = [...repositoriesProviders, MailSender, Logger];

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TokensModule,
    EmailModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [...allProviders],
  exports: [...allProviders],
})
export class AppModule {}
