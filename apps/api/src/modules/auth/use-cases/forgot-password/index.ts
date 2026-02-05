import { Injectable, NotFoundException } from '@nestjs/common';
import SendEmailFromTemplateUseCase from '~/modules/email/use-cases/send-email-from-template';
import { EmailTemplateType } from '~/modules/email/entities/email-template.entity';
import Env from '~/shared/env';
import { UseCase } from '~/shared/core/use-case';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import GenerateForgotPasswordToken from '~/modules/auth/use-cases/generate-forgot-password-token';

export interface ForgotPasswordParams {
  email: string;
}

@Injectable()
export default class ForgotPassword
  implements UseCase<ForgotPasswordParams, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sendEmailFromTemplate: SendEmailFromTemplateUseCase,
    private readonly generateForgotPasswordToken: GenerateForgotPasswordToken,
  ) {}

  private buildResetUrl(token: string): string {
    return `${Env.frontendUrl}/reset-password?token=${token}`;
  }

  async execute({ email }: ForgotPasswordParams): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plainToken = await this.generateForgotPasswordToken.execute(user.id);

    const resetUrl = this.buildResetUrl(plainToken);
    await this.sendEmailFromTemplate.execute({
      to: user.email,
      templateType: EmailTemplateType.PASSWORD_RESET,
      variables: {
        username: user.username,
        resetUrl,
        year: new Date().getFullYear().toString(),
      },
    });
  }
}
