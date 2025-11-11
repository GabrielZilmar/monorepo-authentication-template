import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  FindUserByIdParamsDTO,
  UpdateUserParamsDTO,
  UpdateUserBodyDTO,
  UserDTO,
  DeleteUserParamsDTO,
  ToggleAdminParamsDTO,
} from '@repo/api';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';
import DeleteUser from '~/modules/users/use-cases/delete-user';
import ListUsers from '~/modules/users/use-cases/find-all';
import FindUserById from '~/modules/users/use-cases/find-by-id';
import ToggleAdmin from '~/modules/users/use-cases/toggle-admin';
import UpdateUser from '~/modules/users/use-cases/update-user';
import { RequestWithUser } from '~/types/request-with-user';

@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly findUserById: FindUserById,
    private readonly listUsers: ListUsers,
    private readonly updateUser: UpdateUser,
    private readonly deleteUser: DeleteUser,
    private readonly toggleUserAdminRole: ToggleAdmin,
  ) {}

  @Get(':id')
  findOne(@Param() params: FindUserByIdParamsDTO): Promise<UserDTO> {
    return this.findUserById.execute(params);
  }

  @Get()
  findAll(): Promise<UserDTO[]> {
    return this.listUsers.execute();
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param() { id }: UpdateUserParamsDTO,
    @Body() body: UpdateUserBodyDTO,
  ): Promise<UserDTO> {
    return this.updateUser.execute({ id, currentUser: req.user, ...body });
  }

  @Delete(':id')
  remove(
    @Req() req: RequestWithUser,
    @Param() { id }: DeleteUserParamsDTO,
  ): Promise<boolean> {
    return this.deleteUser.execute({ id, currentUser: req.user });
  }

  @Patch(':id/toggle-admin')
  toggleAdmin(
    @Req() req: RequestWithUser,
    @Param() { id }: ToggleAdminParamsDTO,
  ): Promise<UserDTO> {
    return this.toggleUserAdminRole.execute({
      id,
      currentUser: req.user,
    });
  }
}
