import { Provider } from '@nestjs/common';
import CreateUser from '~/modules/users/use-cases/create';
import DeleteUser from '~/modules/users/use-cases/delete-user';
import ListUsers from '~/modules/users/use-cases/find-all';
import FindUserById from '~/modules/users/use-cases/find-by-id';
import UpdateUser from '~/modules/users/use-cases/update-user';
import { UsersService } from '~/modules/users/users.service';

const userUseCasesProviders: Provider[] = [
  CreateUser,
  FindUserById,
  UpdateUser,
  ListUsers,
  DeleteUser,
  UsersService,
];

export default userUseCasesProviders;
