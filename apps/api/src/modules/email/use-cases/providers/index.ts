import { Provider } from '@nestjs/common';
import SendEmailFromTemplateUseCase from '~/modules/email/use-cases/send-email-from-template';

const emailUseCasesProviders: Provider[] = [SendEmailFromTemplateUseCase];

export default emailUseCasesProviders;
