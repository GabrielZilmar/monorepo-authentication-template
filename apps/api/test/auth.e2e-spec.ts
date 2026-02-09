import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '~/app.module';
import { MailSender } from '~/services/email/mailsender';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import GenerateEmailVerificationToken from '~/modules/auth/use-cases/generate-email-verification-token';
import GenerateForgotPasswordToken from '~/modules/auth/use-cases/generate-forgot-password-token';

type SeedUser = {
  id: string;
  email: string;
  username: string;
  password: string;
  isAdmin: boolean;
};

describe('AuthController (e2e)', () => {
  jest.setTimeout(30000);

  let testingModule: TestingModule;
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;

  let userAccessToken = '';
  let userRefreshToken = '';

  const mailSenderMock = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  const users: Record<string, SeedUser> = {} as Record<string, SeedUser>;

  const seedUser = async (payload: {
    email: string;
    password: string;
    username: string;
    isAdmin?: boolean;
  }): Promise<SeedUser> => {
    const userRepository = testingModule.get(UserRepository);
    const created = await userRepository.create({
      email: payload.email,
      password: payload.password,
      username: payload.username,
      isAdmin: payload.isAdmin ?? false,
    });

    return {
      id: created.id,
      email: created.email,
      username: created.username,
      password: payload.password,
      isAdmin: created.isAdmin,
    };
  };

  const login = async (email: string, password: string) => {
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    return response.body as { accessToken: string; refreshToken: string };
  };

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailSender)
      .useValue(mailSenderMock)
      .compile();

    app = testingModule.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    httpServer = app.getHttpServer();

    const suffix = Date.now().toString(36);

    users.regular = await seedUser({
      email: `user-${suffix}@example.com`,
      password: 'UserPass123!',
      username: `User ${suffix}`,
    });

    users.verify = await seedUser({
      email: `verify-${suffix}@example.com`,
      password: 'VerifyPass123!',
      username: `Verify ${suffix}`,
    });

    users.forgot = await seedUser({
      email: `forgot-${suffix}@example.com`,
      password: 'ForgotPass123!',
      username: `Forgot ${suffix}`,
    });

    users.reset = await seedUser({
      email: `reset-${suffix}@example.com`,
      password: 'ResetPass123!',
      username: `Reset ${suffix}`,
    });

    const userLogin = await login(users.regular.email, users.regular.password);
    userAccessToken = userLogin.accessToken;
    userRefreshToken = userLogin.refreshToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/register', async () => {
    const suffix = Date.now().toString(36);
    const payload = {
      email: `register-${suffix}@example.com`,
      password: 'RegisterPass123!',
      passwordConfirm: 'RegisterPass123!',
      username: `Register ${suffix}`,
    };

    const response = await request(httpServer)
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: payload.email.toLowerCase(),
          username: payload.username,
        }),
      }),
    );
  });

  it('POST /api/auth/login', async () => {
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: users.regular.email, password: users.regular.password })
      .expect(201);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('GET /api/auth/me', async () => {
    const response = await request(httpServer)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: users.regular.id,
        email: users.regular.email,
        username: users.regular.username,
      }),
    );
    expect(response.body.password).toBeUndefined();
  });

  it('POST /api/auth/refresh', async () => {
    const response = await request(httpServer)
      .post('/api/auth/refresh')
      .send({ refreshToken: userRefreshToken })
      .expect(201);

    expect(response.body).toEqual({ accessToken: expect.any(String) });
  });

  it('POST /api/auth/send-verification-email', async () => {
    const callsBefore = mailSenderMock.sendEmail.mock.calls.length;

    await request(httpServer)
      .post('/api/auth/send-verification-email')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(201);

    expect(mailSenderMock.sendEmail.mock.calls.length).toBeGreaterThan(
      callsBefore,
    );
  });

  it('POST /api/auth/verify-email', async () => {
    const token = await testingModule
      .get(GenerateEmailVerificationToken)
      .execute(users.verify.id);

    await request(httpServer)
      .post('/api/auth/verify-email')
      .query({ token })
      .expect(201);

    const updatedUser = await testingModule
      .get(UserRepository)
      .findOneById(users.verify.id);
    expect(updatedUser?.emailVerified).toBe(true);
  });

  it('POST /api/auth/forgot-password', async () => {
    await request(httpServer)
      .post('/api/auth/forgot-password')
      .send({ email: users.forgot.email })
      .expect(201);
  });

  it('POST /api/auth/reset-password', async () => {
    const newPassword = 'NewResetPass123!';
    const token = await testingModule
      .get(GenerateForgotPasswordToken)
      .execute(users.reset.id);

    await request(httpServer)
      .post('/api/auth/reset-password')
      .send({ token, password: newPassword, passwordConfirm: newPassword })
      .expect(201);

    await request(httpServer)
      .post('/api/auth/login')
      .send({ email: users.reset.email, password: newPassword })
      .expect(201);
  });

  it('POST /api/auth/logout', async () => {
    const sessionLogin = await login(
      users.regular.email,
      users.regular.password,
    );

    await request(httpServer)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${sessionLogin.accessToken}`)
      .expect(201);

    await request(httpServer)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${sessionLogin.accessToken}`)
      .expect(401);
  });
});
