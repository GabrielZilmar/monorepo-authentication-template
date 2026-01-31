import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import Env from '~/shared/env';
import { AppModule } from '~/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(Env.port);
}

void bootstrap();
