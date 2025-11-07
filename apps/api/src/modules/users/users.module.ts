import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '~/modules/users/entities/user.entity';
import userUseCasesProviders from '~/modules/users/use-cases/provider';
import { UsersController } from '~/modules/users/users.controller';
import { UsersService } from '~/modules/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [...userUseCasesProviders, UsersService],
  exports: [...userUseCasesProviders, UsersService],
})
export class UsersModule {}
