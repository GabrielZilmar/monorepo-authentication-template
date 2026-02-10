import { describe, it, expect, beforeEach } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EmailTemplateType } from '~/modules/email/entities/email-template.entity';
import SendEmailFromTemplateUseCase from '~/modules/email/use-cases/send-email-from-template';
import GenerateEmailVerificationToken from '~/modules/auth/use-cases/generate-email-verification-token';
import { User } from '~/modules/users/entities/user.entity';
import SendVerificationEmail from './index';
import Env from '~/shared/env';
import { buildUser } from 'test/test-utils/factories';

describe('SendVerificationEmail Use Case', () => {
  let userRepository: jest.Mocked<Repository<User>>;
  let generateToken: jest.Mocked<GenerateEmailVerificationToken>;
  let sendEmailFromTemplate: jest.Mocked<SendEmailFromTemplateUseCase>;
  let sendVerificationEmail: SendVerificationEmail;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;
    generateToken = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GenerateEmailVerificationToken>;
    sendEmailFromTemplate = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SendEmailFromTemplateUseCase>;

    sendVerificationEmail = new SendVerificationEmail(
      userRepository,
      generateToken,
      sendEmailFromTemplate,
    );
  });

  it('should throw when user is not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(sendVerificationEmail.execute('missing-id')).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });

  it('should send verification email', async () => {
    const user = buildUser({ id: 'user-id', email: 'user@example.com' });
    userRepository.findOne.mockResolvedValue(user);
    generateToken.execute.mockResolvedValue('plain-token');

    await sendVerificationEmail.execute(user.id);

    const expectedUrl = `${Env.frontendUrl}/verify-email?token=plain-token`;
    expect(sendEmailFromTemplate.execute).toHaveBeenCalledWith({
      to: user.email,
      templateType: EmailTemplateType.EMAIL_VERIFICATION,
      variables: {
        username: user.username,
        verificationUrl: expectedUrl,
        year: new Date().getFullYear().toString(),
      },
    });
  });
});
