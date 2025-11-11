import { ConfigModule } from '@nestjs/config';

void ConfigModule.forRoot({
  envFilePath: '.env',
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

  private static getEnvOrDefault(
    envName: string,
    defaultValue: string,
  ): string {
    return process.env[envName] ?? defaultValue;
  }
}
