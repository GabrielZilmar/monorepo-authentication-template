import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '~/modules/users/entities/user.entity';
import Env from '~/shared/env';
import SendEmailFromTemplateUseCase from '~/modules/email/use-cases/send-email-from-template';
import { EmailTemplateType } from '~/modules/email/entities/email-template.entity';
import { UseCase } from '~/shared/core/use-case';
import GenerateEmailVerificationToken from '~/modules/auth/use-cases/generate-email-verification-token';

@Injectable()
export default class SendVerificationEmail implements UseCase<string, void> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly generateTokenUseCase: GenerateEmailVerificationToken,
    private readonly sendEmailFromTemplate: SendEmailFromTemplateUseCase,
  ) {}

  private buildVerificationUrl(token: string): string {
    return `${Env.frontendUrl}/verify-email?token=${token}`;
  }

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = await this.generateTokenUseCase.execute(user.id);

    const verificationUrl = this.buildVerificationUrl(token);

    await this.sendEmailFromTemplate.execute({
      to: user.email,
      templateType: EmailTemplateType.EMAIL_VERIFICATION,
      variables: {
        username: user.username,
        verificationUrl,
        year: new Date().getFullYear().toString(),
      },
    });
  }
}
