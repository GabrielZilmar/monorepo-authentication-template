import { describe, it, expect } from '@jest/globals';
import emailUseCasesProviders from './index';
import SendEmailFromTemplateUseCase from '~/modules/email/use-cases/send-email-from-template';

describe('Email Use Case Providers', () => {
  it('should include SendEmailFromTemplateUseCase', () => {
    expect(emailUseCasesProviders).toEqual([SendEmailFromTemplateUseCase]);
  });
});
