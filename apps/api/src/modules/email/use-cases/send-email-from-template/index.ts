import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EmailTemplate,
  EmailTemplateType,
} from '~/modules/email/entities/email-template.entity';
import EmailTemplateRepository from '~/services/database/typeorm/repositories/email-template.repository';
import { MailSender } from '~/services/email/mailsender';
import { UseCase } from '~/shared/core/use-case';

export interface SendEmailFromTemplateParams {
  templateType: EmailTemplateType;
  to: string;
  variables: Record<string, string>;
}

@Injectable()
export default class SendEmailFromTemplateUseCase
  implements UseCase<SendEmailFromTemplateParams, void>
{
  constructor(
    private readonly mailSender: MailSender,
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  private render(template: EmailTemplate, variables: Record<string, string>) {
    const replace = (content = '') =>
      Object.entries(variables).reduce(
        (acc, [key, value]) =>
          acc.replace(new RegExp(`{{${key}}}`, 'g'), value),
        content,
      );

    return {
      subject: replace(template.subject),
      html: replace(template.htmlTemplate),
      text: replace(template.textTemplate),
    };
  }

  async execute({ templateType, to, variables }: SendEmailFromTemplateParams) {
    const template =
      await this.emailTemplateRepository.findByType(templateType);
    if (!template) {
      throw new NotFoundException(
        `Email template not found for type: ${templateType}`,
      );
    }

    const rendered = this.render(template, variables);

    await this.mailSender.sendEmail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }
}
