import { Provider } from '@nestjs/common';
import RegisterUser from '~/modules/auth/use-cases/register';
import Login from '~/modules/auth/use-cases/login';
import ValidateUser from '~/modules/auth/use-cases/validate-user';
import SendVerificationEmail from '~/modules/auth/use-cases/send-verification-email';
import VerifyEmail from '~/modules/auth/use-cases/verify-email';
import GenerateEmailVerificationToken from '~/modules/auth/use-cases/generate-email-verification-token';

const authUseCasesProviders: Provider[] = [
  RegisterUser,
  Login,
  ValidateUser,
  GenerateEmailVerificationToken,
  SendVerificationEmail,
  VerifyEmail,
];

export default authUseCasesProviders;
