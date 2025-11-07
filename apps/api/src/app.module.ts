import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import { AuthModule } from '~/modules/auth/auth.module';
import { DatabaseModule } from '~/modules/database/database.module';
import { UsersController } from '~/modules/users/users.controller';
import { UsersModule } from '~/modules/users/users.module';
import repositoriesProviders from '~/services/database/typeorm/repositories/providers';

const allProviders = [...repositoriesProviders, AppService];

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController, UsersController],
  providers: [...allProviders],
  exports: [...allProviders],
})
export class AppModule {}
