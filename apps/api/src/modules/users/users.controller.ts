import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  FindUserByIdParamsDTO,
  UpdateUserParamsDTO,
  UpdateUserBodyDTO,
  UserDTO,
  DeleteUserParamsDTO,
  DeleteUserResponseDTO,
  ToggleAdminParamsDTO,
  ListUsersQueryDTO,
} from '@repo/api';
import { AdminGuard } from '~/modules/auth/guards/admin.guard';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';
import DeleteUser from '~/modules/users/use-cases/delete-user';
import ListUsers, { ListUsersResult } from '~/modules/users/use-cases/find-all';
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
  @UseGuards(AdminGuard)
  findOne(@Param() params: FindUserByIdParamsDTO): Promise<UserDTO> {
    return this.findUserById.execute(params);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll(@Query() query: ListUsersQueryDTO): Promise<ListUsersResult> {
    return this.listUsers.execute(query);
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
  async remove(
    @Req() req: RequestWithUser,
    @Param() { id }: DeleteUserParamsDTO,
  ): Promise<DeleteUserResponseDTO> {
    const success = await this.deleteUser.execute({
      id,
      currentUser: req.user,
    });

    return { success };
  }

  @Patch(':id/toggle-admin')
  @UseGuards(AdminGuard)
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
