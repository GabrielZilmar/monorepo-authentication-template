import { ConfigModule } from '@nestjs/config';
import { Environment } from '~/shared/env';

const envFilePath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

void ConfigModule.forRoot({
  envFilePath,
});

const NODE_ENV = process.env.NODE_ENV;

const getDatabasePort = () =>
  Number((process.env.DATABASE_PORT as string) || 0);

const databaseConfig = {
  databaseHost: process.env.DATABASE_HOST as string,
  get port() {
    return getDatabasePort();
  },
  username: process.env.DATABASE_USERNAME as string,
  password: process.env.DATABASE_PASSWORD as string,
  database: process.env.DATABASE_NAME as string,
  ssl: NODE_ENV === Environment.PROD,
  extra:
    NODE_ENV === Environment.PROD
      ? { ssl: { rejectUnauthorized: false } }
      : undefined,
};

export default databaseConfig;
