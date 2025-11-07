import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  CreateUserDto,
  FindUserByIdParamsDTO,
  UpdateUserParamsDTO,
  UpdateUserBodyDTO,
  User,
  DeleteUserParamsDTO,
} from '@repo/api';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';
import CreateUser from '~/modules/users/use-cases/create';
import DeleteUser from '~/modules/users/use-cases/delete-user';
import ListUsers from '~/modules/users/use-cases/find-all';
import FindUserById from '~/modules/users/use-cases/find-by-id';
import UpdateUser from '~/modules/users/use-cases/update-user';

// @UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly findUserById: FindUserById,
    private readonly listUsers: ListUsers,
    private readonly updateUser: UpdateUser,
    private readonly deleteUser: DeleteUser,
  ) {}

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.createUser.execute(body);
  }

  @Get(':id')
  findOne(@Param() params: FindUserByIdParamsDTO): Promise<User> {
    return this.findUserById.execute(params);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.listUsers.execute();
  }

  @Patch(':id')
  update(
    @Param() { id }: UpdateUserParamsDTO,
    @Body() body: UpdateUserBodyDTO,
  ): Promise<User> {
    // TODO: Add currentUser
    return this.updateUser.execute({ id, ...body });
  }

  @Delete(':id')
  remove(@Param() params: DeleteUserParamsDTO): Promise<boolean> {
    return this.deleteUser.execute(params);
  }
}
