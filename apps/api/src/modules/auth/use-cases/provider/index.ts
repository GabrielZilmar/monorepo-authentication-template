import { Provider } from '@nestjs/common';
import RegisterUser from '~/modules/auth/use-cases/register';

const authUseCasesProviders: Provider[] = [RegisterUser];

export default authUseCasesProviders;
