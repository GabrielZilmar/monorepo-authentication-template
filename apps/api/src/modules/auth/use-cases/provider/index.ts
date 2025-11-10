import { Provider } from '@nestjs/common';
import RegisterUser from '~/modules/auth/use-cases/register';
import Login from '~/modules/auth/use-cases/login';
import ValidateUser from '~/modules/auth/use-cases/validate-user';

const authUseCasesProviders: Provider[] = [RegisterUser, Login, ValidateUser];

export default authUseCasesProviders;
