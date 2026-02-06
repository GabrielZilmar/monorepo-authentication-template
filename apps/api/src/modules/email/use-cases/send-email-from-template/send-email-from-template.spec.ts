import { describe, it, expect, beforeEach } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import SendEmailFromTemplateUseCase from './index';
import { EmailTemplateType } from '~/modules/email/entities/email-template.entity';
import EmailTemplateRepository from '~/services/database/typeorm/repositories/email-template.repository';
import { MailSender } from '~/services/email/mailsender';

describe('SendEmailFromTemplate Use Case', () => {
  let mailSender: jest.Mocked<MailSender>;
  let emailTemplateRepository: jest.Mocked<EmailTemplateRepository>;
  let sendEmailFromTemplate: SendEmailFromTemplateUseCase;

  beforeEach(() => {
    mailSender = {
      sendEmail: jest.fn(),
    } as unknown as jest.Mocked<MailSender>;
    emailTemplateRepository = {
      findByType: jest.fn(),
    } as unknown as jest.Mocked<EmailTemplateRepository>;

    sendEmailFromTemplate = new SendEmailFromTemplateUseCase(
      mailSender,
      emailTemplateRepository,
    );
  });

  it('should throw when template is not found', async () => {
    emailTemplateRepository.findByType.mockResolvedValue(null);

    await expect(
      sendEmailFromTemplate.execute({
        templateType: EmailTemplateType.WELCOME,
        to: 'user@example.com',
        variables: {},
      }),
    ).rejects.toThrow(
      new NotFoundException(
        `Email template not found for type: ${EmailTemplateType.WELCOME}`,
      ),
    );
  });

  it('should render and send the email', async () => {
    emailTemplateRepository.findByType.mockResolvedValue({
      id: 'template-id',
      type: EmailTemplateType.WELCOME,
      subject: 'Welcome {{username}}',
      htmlTemplate: '<p>Hello {{username}}</p>',
      textTemplate: 'Hello {{username}}',
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    });

    await sendEmailFromTemplate.execute({
      templateType: EmailTemplateType.WELCOME,
      to: 'user@example.com',
      variables: { username: 'User' },
    });

    expect(mailSender.sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome User',
      html: '<p>Hello User</p>',
      text: 'Hello User',
    });
  });

  it('should default missing text template to empty string', async () => {
    emailTemplateRepository.findByType.mockResolvedValue({
      id: 'template-id',
      type: EmailTemplateType.WELCOME,
      subject: 'Welcome {{username}}',
      htmlTemplate: '<p>Hello {{username}}</p>',
      textTemplate: undefined as unknown as string,
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    });

    await sendEmailFromTemplate.execute({
      templateType: EmailTemplateType.WELCOME,
      to: 'user@example.com',
      variables: { username: 'User' },
    });

    expect(mailSender.sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome User',
      html: '<p>Hello User</p>',
      text: '',
    });
  });
});
