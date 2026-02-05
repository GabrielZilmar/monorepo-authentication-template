import { EmailContract, SendEmailOptions } from '~/services/email/contract';
import nodemailer, { Transporter } from 'nodemailer';
import Env from '~/shared/env';

export class MailSender implements EmailContract {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: Env.smtpHost,
      port: Env.smtpPort,
      secure: Env.smtpSecure,
      auth: {
        user: Env.smtpUser,
        pass: Env.smtpPassword,
      },
    });
  }

  private stripHtml(html: string): string {
    const withoutTags = html.replaceAll(/<[^>]*>/g, '');
    return withoutTags.replaceAll(/\s+/g, ' ').trim();
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: {
        name: Env.mailSenderFromName,
        address: Env.mailSenderFromEmail,
      },
      to: options.to,
      subject: options.subject,
      text: options.text || this.stripHtml(options.html),
      html: options.html,
    });
  }
}
