import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { EmailTemplateType } from '~/modules/email/entities/email-template.entity';

export default class EmailTemplateSeeder implements Seeder {
  track = true;

  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository('EmailTemplate');

    const templates = [
      {
        type: EmailTemplateType.EMAIL_VERIFICATION,
        subject: 'Verify your email address',
        htmlTemplate: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background-color: #ffffff;
                  border-radius: 8px;
                  padding: 40px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .logo {
                  font-size: 32px;
                  font-weight: bold;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
                .content {
                  margin-bottom: 30px;
                }
                .button {
                  display: inline-block;
                  padding: 14px 32px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #ffffff !important;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  text-align: center;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #e0e0e0;
                  font-size: 12px;
                  color: #666;
                  text-align: center;
                }
                .warning {
                  background-color: #fff3cd;
                  border-left: 4px solid #ffc107;
                  padding: 12px;
                  margin-top: 20px;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">MyApp</div>
                </div>
                
                <div class="content">
                  <h2>Welcome, {{username}}! 👋</h2>
                  <p>Thank you for signing up! We're excited to have you on board.</p>
                  <p>To complete your registration, please verify your email address by clicking the button below:</p>
                  
                  <p style="text-align: center; margin: 30px 0;">
                    <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
                  </p>
                  
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #667eea; font-size: 14px;">
                    {{verificationUrl}}
                  </p>
                  
                  <div class="warning">
                    <strong>⏱️ This link will expire in 24 hours.</strong>
                  </div>
                </div>
                
                <div class="footer">
                  <p>If you didn't create an account, please ignore this email.</p>
                  <p>© {{year}} MyApp. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        textTemplate: `Hi {{username}},

Thank you for signing up! Please verify your email address by clicking the link below:

{{verificationUrl}}

This link will expire in a couple of minutes.

If you didn't create an account, please ignore this email.

© {{year}} MyApp. All rights reserved.`,
      },
      {
        type: EmailTemplateType.PASSWORD_RESET,
        subject: 'Reset your password',
        htmlTemplate: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background-color: #ffffff;
                  border-radius: 8px;
                  padding: 40px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .logo {
                  font-size: 32px;
                  font-weight: bold;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
                .content {
                  margin-bottom: 30px;
                }
                .button {
                  display: inline-block;
                  padding: 14px 32px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #ffffff !important;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  text-align: center;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #e0e0e0;
                  font-size: 12px;
                  color: #666;
                  text-align: center;
                }
                .warning {
                  background-color: #fff3cd;
                  border-left: 4px solid #ffc107;
                  padding: 12px;
                  margin-top: 20px;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">MyApp</div>
                </div>
                
                <div class="content">
                  <h2>Reset Your Password</h2>
                  <p>Hi {{username}},</p>
                  <p>We received a request to reset your password. Click the button below to create a new password:</p>
                  
                  <p style="text-align: center; margin: 30px 0;">
                    <a href="{{resetUrl}}" class="button">Reset Password</a>
                  </p>
                  
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #667eea; font-size: 14px;">
                    {{resetUrl}}
                  </p>
                  
                  <div class="warning">
                    <strong>⏱️ This link will expire in 1 hour.</strong>
                  </div>
                </div>
                
                <div class="footer">
                  <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                  <p>© {{year}} MyApp. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        textTemplate: `Hi {{username}},

We received a request to reset your password. Click the link below to reset it:

{{resetUrl}}

This link will expire in a couple of minutes.

If you didn't request this, please ignore this email.

© {{year}} MyApp. All rights reserved.`,
      },
    ];

    await repository.save(templates);
  }
}
