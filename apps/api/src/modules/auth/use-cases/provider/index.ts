import { Provider } from '@nestjs/common';
import RegisterUser from '~/modules/auth/use-cases/register';
import Login from '~/modules/auth/use-cases/login';
import ValidateUser from '~/modules/auth/use-cases/validate-user';
import GetMe from '~/modules/auth/use-cases/get-me';

const authUseCasesProviders: Provider[] = [
  RegisterUser,
  Login,
  ValidateUser,
  GetMe,
];

export default authUseCasesProviders;
