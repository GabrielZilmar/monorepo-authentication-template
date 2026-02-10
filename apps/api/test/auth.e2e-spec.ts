import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '~/app.module';
import { MailSender } from '~/services/email/mailsender';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import GenerateEmailVerificationToken from '~/modules/auth/use-cases/generate-email-verification-token';
import GenerateForgotPasswordToken from '~/modules/auth/use-cases/generate-forgot-password-token';
import { DataSource } from 'typeorm';
import Login from '~/modules/auth/use-cases/login';
import ValidateUser from '~/modules/auth/use-cases/validate-user';
import SendVerificationEmail from '~/modules/auth/use-cases/send-verification-email';
import RegisterUser from '~/modules/auth/use-cases/register';
import RefreshToken from '~/modules/auth/use-cases/refresh-token';
import ResetPassword from '~/modules/auth/use-cases/reset-password';
import VerifyEmail from '~/modules/auth/use-cases/verify-email';
import Logout from '~/modules/auth/use-cases/logout';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import CryptoUtils from '~/shared/crypto.util';
import { EmailTemplateType } from '~/modules/email/entities/email-template.entity';
import SendEmailFromTemplateUseCase from '~/modules/email/use-cases/send-email-from-template';
import EmailTemplateRepository from '~/services/database/typeorm/repositories/email-template.repository';
import { TokenType } from '~/modules/tokens/entities/token.entity';
import { buildSession, buildToken } from './test-utils/factories';

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

  const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

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
    await testingModule.get(DataSource).destroy();
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

  it('POST /api/auth/forgot-password returns 404 if not found user', async () => {
    await request(httpServer)
      .post('/api/auth/forgot-password')
      .send({ email: `invalid-${users.forgot.email}` })
      .expect(404);
  });

  it('POST /api/auth/forgot-password returns 400 if token still valid', async () => {
    await request(httpServer)
      .post('/api/auth/forgot-password')
      .send({ email: users.forgot.email })
      .expect(400);
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

  it('POST /api/auth/login returns 401 for invalid credentials', async () => {
    await request(httpServer)
      .post('/api/auth/login')
      .send({ email: users.regular.email, password: 'WrongPass123!' })
      .expect(401);
  });

  it('GET /api/auth/me returns 401 without token', async () => {
    await request(httpServer).get('/api/auth/me').expect(401);
  });

  it('POST /api/auth/refresh returns 401 for invalid token', async () => {
    await request(httpServer)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);
  });

  it('POST /api/auth/send-verification-email returns 401 without token', async () => {
    await request(httpServer)
      .post('/api/auth/send-verification-email')
      .expect(401);
  });

  it('POST /api/auth/send-verification-email returns 400 if token still valid', async () => {
    const callsBefore = mailSenderMock.sendEmail.mock.calls.length;
    await request(httpServer)
      .post('/api/auth/send-verification-email')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(400);
    expect(mailSenderMock.sendEmail.mock.calls.length).toEqual(callsBefore);
  });

  it('POST /api/auth/verify-email returns 404 for invalid token', async () => {
    await request(httpServer)
      .post('/api/auth/verify-email')
      .query({ token: 'invalid-token' })
      .expect(404);
  });

  it('RegisterUser logs when send-verification-email fails', async () => {
    const registerUser = testingModule.get(RegisterUser);
    const sendVerificationEmail = testingModule.get(SendVerificationEmail);
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const sendSpy = jest
      .spyOn(sendVerificationEmail, 'execute')
      .mockRejectedValueOnce(new Error('Send failed'));

    try {
      const suffix = Date.now().toString(36);
      const result = await registerUser.execute({
        email: `register-fail-${suffix}@example.com`,
        password: 'RegisterFail123!',
        username: `Register Fail ${suffix}`,
      });

      await flushPromises();

      expect(result.user.email).toBe(
        `register-fail-${suffix}@example.com`.toLowerCase(),
      );
    } finally {
      sendSpy.mockRestore();
      loggerSpy.mockRestore();
    }
  });

  it('Login use-case returns 404 when user not found', async () => {
    const loginUseCase = testingModule.get(Login);

    await expect(
      loginUseCase.execute({
        email: `missing-${Date.now().toString(36)}@example.com`,
        password: 'MissingPass123!',
      }),
    ).rejects.toThrow('User not found');
  });

  it('Login use-case returns 401 when password is invalid', async () => {
    const loginUseCase = testingModule.get(Login);

    await expect(
      loginUseCase.execute({
        email: users.regular.email,
        password: 'WrongPass123!',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('ValidateUser returns null when user is missing', async () => {
    const validateUser = testingModule.get(ValidateUser);

    const result = await validateUser.execute({
      email: `missing-${Date.now().toString(36)}@example.com`,
      password: 'MissingPass123!',
    });

    expect(result).toBeNull();
  });

  it('SendVerificationEmail returns 404 for missing user', async () => {
    const sendVerificationEmail = testingModule.get(SendVerificationEmail);

    await expect(
      sendVerificationEmail.execute('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('User not found');
  });

  it('POST /api/auth/refresh returns 401 for expired refresh token', async () => {
    const sessionRepository = testingModule.get(SessionRepository);
    const { refreshToken, session } = await sessionRepository.createSession(
      users.regular.id,
      -1,
    );

    await request(httpServer)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    const stored = await sessionRepository.findOneById(session.id);
    expect(stored?.isActive).toBe(false);
  });

  it('RefreshToken returns 401 for inactive session', async () => {
    const refreshTokenUseCase = testingModule.get(RefreshToken);
    const findSpy = jest
      .spyOn(SessionRepository.prototype, 'findByRefreshToken')
      .mockResolvedValueOnce(
        buildSession({
          isActive: false,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        }),
      );

    try {
      await expect(
        refreshTokenUseCase.execute({ refreshToken: 'inactive-token' }),
      ).rejects.toThrow('Session is no longer active');
    } finally {
      findSpy.mockRestore();
    }
  });

  it('POST /api/auth/reset-password returns 404 for invalid token', async () => {
    await request(httpServer)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalid-token',
        password: 'InvalidPass123!',
        passwordConfirm: 'InvalidPass123!',
      })
      .expect(404);
  });

  it('POST /api/auth/reset-password returns 400 for expired token', async () => {
    const suffix = Date.now().toString(36);
    const expiredUser = await seedUser({
      email: `expired-reset-${suffix}@example.com`,
      password: 'ExpiredReset123!',
      username: `Expired Reset ${suffix}`,
    });

    const token = await testingModule
      .get(GenerateForgotPasswordToken)
      .execute(expiredUser.id);
    const tokenRepository = testingModule.get(TokenRepository);
    const hashedToken = CryptoUtils.hashToken(token);

    await tokenRepository.repository.update(
      { hashedToken },
      { expiresAt: new Date(Date.now() - 1000) },
    );

    await request(httpServer)
      .post('/api/auth/reset-password')
      .send({
        token,
        password: 'ExpiredResetPass123!',
        passwordConfirm: 'ExpiredResetPass123!',
      })
      .expect(400);
  });

  it('ResetPassword returns 400 for used token', async () => {
    const resetPassword = testingModule.get(ResetPassword);
    const usedToken = buildToken({
      type: TokenType.PASSWORD_RESET,
      used: true,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const findSpy = jest
      .spyOn(TokenRepository.prototype, 'findByHashedToken')
      .mockResolvedValueOnce(usedToken);

    try {
      await expect(
        resetPassword.execute({
          token: 'used-token',
          password: 'UsedPass123!',
        }),
      ).rejects.toThrow('Reset token has already been used');
    } finally {
      findSpy.mockRestore();
    }
  });

  it('ResetPassword returns 404 when user is missing', async () => {
    const resetPassword = testingModule.get(ResetPassword);
    const missingUserToken = buildToken({
      type: TokenType.PASSWORD_RESET,
      used: false,
      userId: '00000000-0000-0000-0000-000000000000',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const findSpy = jest
      .spyOn(TokenRepository.prototype, 'findByHashedToken')
      .mockResolvedValueOnce(missingUserToken);

    try {
      await expect(
        resetPassword.execute({
          token: 'missing-user-token',
          password: 'MissingPass123!',
        }),
      ).rejects.toThrow('User not found');
    } finally {
      findSpy.mockRestore();
    }
  });

  it('POST /api/auth/verify-email returns 400 for expired token', async () => {
    const suffix = Date.now().toString(36);
    const expiredVerifyUser = await seedUser({
      email: `expired-verify-${suffix}@example.com`,
      password: 'ExpiredVerify123!',
      username: `Expired Verify ${suffix}`,
    });

    const tokenRepository = testingModule.get(TokenRepository);
    const { plainToken } = await tokenRepository.createToken(
      expiredVerifyUser.id,
      TokenType.EMAIL_VERIFICATION,
      1,
    );
    const hashedToken = CryptoUtils.hashToken(plainToken);

    await tokenRepository.repository.update(
      { hashedToken },
      { expiresAt: new Date(Date.now() - 1000) },
    );

    await request(httpServer)
      .post('/api/auth/verify-email')
      .query({ token: plainToken })
      .expect(400);
  });

  it('VerifyEmail returns 400 for used token', async () => {
    const verifyEmail = testingModule.get(VerifyEmail);
    const usedToken = buildToken({
      type: TokenType.EMAIL_VERIFICATION,
      used: true,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const findSpy = jest
      .spyOn(TokenRepository.prototype, 'findByHashedToken')
      .mockResolvedValueOnce(usedToken);

    try {
      await expect(verifyEmail.execute('used-token')).rejects.toThrow(
        'Verification token has already been used',
      );
    } finally {
      findSpy.mockRestore();
    }
  });

  it('VerifyEmail returns 404 when user is missing', async () => {
    const verifyEmail = testingModule.get(VerifyEmail);
    const missingUserToken = buildToken({
      type: TokenType.EMAIL_VERIFICATION,
      used: false,
      userId: '00000000-0000-0000-0000-000000000000',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const findSpy = jest
      .spyOn(TokenRepository.prototype, 'findByHashedToken')
      .mockResolvedValueOnce(missingUserToken);

    try {
      await expect(verifyEmail.execute('missing-user-token')).rejects.toThrow(
        'User not found',
      );
    } finally {
      findSpy.mockRestore();
    }
  });

  it('POST /api/auth/verify-email returns 400 for already verified user', async () => {
    const suffix = Date.now().toString(36);
    const verifiedUser = await seedUser({
      email: `already-verified-${suffix}@example.com`,
      password: 'VerifiedPass123!',
      username: `Verified ${suffix}`,
    });

    const userRepository = testingModule.get(UserRepository);
    await userRepository.repository.update(verifiedUser.id, {
      emailVerified: true,
    });

    const tokenRepository = testingModule.get(TokenRepository);
    const { plainToken } = await tokenRepository.createToken(
      verifiedUser.id,
      TokenType.EMAIL_VERIFICATION,
      1,
    );

    await request(httpServer)
      .post('/api/auth/verify-email')
      .query({ token: plainToken })
      .expect(400);
  });

  it('SendEmailFromTemplate returns 404 for missing template', async () => {
    const sendEmailFromTemplate = testingModule.get(
      SendEmailFromTemplateUseCase,
    );
    const findSpy = jest
      .spyOn(EmailTemplateRepository.prototype, 'findByType')
      .mockResolvedValueOnce(null);

    try {
      await expect(
        sendEmailFromTemplate.execute({
          templateType: EmailTemplateType.WELCOME,
          to: 'missing-template@example.com',
          variables: {
            username: 'Missing Template',
            verificationUrl: 'https://example.com',
            year: '2026',
          },
        }),
      ).rejects.toThrow('Email template not found');
    } finally {
      findSpy.mockRestore();
    }
  });

  it('Logout use-case deactivates session', async () => {
    const sessionRepository = testingModule.get(SessionRepository);
    const logoutUseCase = testingModule.get(Logout);
    const { session } = await sessionRepository.createSession(users.regular.id);

    await logoutUseCase.execute({ sessionId: session.id });

    const stored = await sessionRepository.findOneById(session.id);
    expect(stored?.isActive).toBe(false);
  });
});
