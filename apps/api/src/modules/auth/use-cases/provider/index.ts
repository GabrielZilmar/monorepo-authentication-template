import { Provider } from '@nestjs/common';
import RegisterUser from '~/modules/auth/use-cases/register';
import Login from '~/modules/auth/use-cases/login';
import ValidateUser from '~/modules/auth/use-cases/validate-user';
import SendVerificationEmail from '~/modules/auth/use-cases/send-verification-email';
import VerifyEmail from '~/modules/auth/use-cases/verify-email';
import GenerateEmailVerificationToken from '~/modules/auth/use-cases/generate-email-verification-token';
import ForgotPassword from '~/modules/auth/use-cases/forgot-password';
import ResetPassword from '~/modules/auth/use-cases/reset-password';
import GenerateForgotPasswordToken from '~/modules/auth/use-cases/generate-forgot-password-token';

const authUseCasesProviders: Provider[] = [
  RegisterUser,
  Login,
  ValidateUser,
  GenerateEmailVerificationToken,
  GenerateForgotPasswordToken,
  SendVerificationEmail,
  VerifyEmail,
  ForgotPassword,
  ResetPassword,
];

export default authUseCasesProviders;
