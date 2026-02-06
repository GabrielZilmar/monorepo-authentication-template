import { describe, it, expect, beforeEach } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import SendEmailFromTemplateUseCase from '~/modules/email/use-cases/send-email-from-template';
import GenerateForgotPasswordToken from '~/modules/auth/use-cases/generate-forgot-password-token';
import { EmailTemplateType } from '~/modules/email/entities/email-template.entity';
import ForgotPassword from './index';
import Env from '~/shared/env';
import { buildUser } from 'test/test-utils/factories';

describe('ForgotPassword Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let sendEmailFromTemplate: jest.Mocked<SendEmailFromTemplateUseCase>;
  let generateForgotPasswordToken: jest.Mocked<GenerateForgotPasswordToken>;
  let forgotPassword: ForgotPassword;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    sendEmailFromTemplate = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SendEmailFromTemplateUseCase>;
    generateForgotPasswordToken = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GenerateForgotPasswordToken>;

    forgotPassword = new ForgotPassword(
      userRepository,
      sendEmailFromTemplate,
      generateForgotPasswordToken,
    );
  });

  it('should throw when user is not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      forgotPassword.execute({ email: 'missing@example.com' }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('should send reset email when user exists', async () => {
    const user = buildUser({ email: 'user@example.com', username: 'User' });
    userRepository.findOne.mockResolvedValue(user);
    generateForgotPasswordToken.execute.mockResolvedValue('plain-token');

    await forgotPassword.execute({ email: user.email });

    expect(sendEmailFromTemplate.execute).toHaveBeenCalledWith({
      to: user.email,
      templateType: EmailTemplateType.PASSWORD_RESET,
      variables: {
        username: user.username,
        resetUrl: `${Env.frontendUrl}/reset-password?token=plain-token`,
        year: new Date().getFullYear().toString(),
      },
    });
  });
});
