import { Provider } from '@nestjs/common';
import DeleteUser from '~/modules/users/use-cases/delete-user';
import ListUsers from '~/modules/users/use-cases/find-all';
import FindUserById from '~/modules/users/use-cases/find-by-id';
import ToggleAdmin from '~/modules/users/use-cases/toggle-admin';
import UpdateUser from '~/modules/users/use-cases/update-user';

const userUseCasesProviders: Provider[] = [
  FindUserById,
  UpdateUser,
  ListUsers,
  DeleteUser,
  ToggleAdmin,
];

export default userUseCasesProviders;
