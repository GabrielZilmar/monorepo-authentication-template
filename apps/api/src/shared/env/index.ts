import { ConfigModule } from '@nestjs/config';

const envFilePath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

void ConfigModule.forRoot({
  envFilePath,
});

export enum Environment {
  LOCAL = 'local',
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
}

export default class Env {
  static get port(): number {
    const port = this.getEnvOrDefault('PORT', '3030');

    return Number(port);
  }

  static get jwtSecret(): string {
    return this.getEnvOrThrow('JWT_SECRET');
  }

  static get frontendUrl(): string {
    return this.getEnvOrDefault('FRONTEND_URL', 'http://localhost:3000');
  }

  private static getEnvOrThrow(envName: string): string {
    const env = process.env[envName];
    if (!env) {
      throw new Error(`Missing environment variable ${envName}`);
    }

    return env;
  }

  static get adminEmail(): string {
    return this.getEnvOrThrow('ADMIN_EMAIL');
  }

  static get adminUsername(): string {
    return this.getEnvOrThrow('ADMIN_USERNAME');
  }

  static get adminPassword(): string {
    return this.getEnvOrThrow('ADMIN_PASSWORD');
  }

  static get smtpHost(): string {
    return this.getEnvOrThrow('SMTP_HOST');
  }

  static get smtpPort(): number {
    const port = this.getEnvOrThrow('SMTP_PORT');
    return Number(port);
  }

  static get smtpSecure(): boolean {
    const secure = this.getEnvOrDefault('SMTP_SECURE', 'true');
    return secure.toLowerCase() === 'true';
  }

  static get smtpUser(): string {
    return this.getEnvOrThrow('SMTP_USER');
  }

  static get smtpPassword(): string {
    return this.getEnvOrThrow('SMTP_PASSWORD');
  }

  static get mailSenderFromEmail(): string {
    return this.getEnvOrThrow('MAILSENDER_FROM_EMAIL');
  }

  static get mailSenderFromName(): string {
    return this.getEnvOrDefault('MAILSENDER_FROM_NAME', 'MyApp');
  }

  private static getEnvOrDefault(
    envName: string,
    defaultValue: string,
  ): string {
    return process.env[envName] ?? defaultValue;
  }
}
