import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '~/app.module';
import { MailSender } from '~/services/email/mailsender';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import { DataSource, Not } from 'typeorm';
import ToggleAdmin from '~/modules/users/use-cases/toggle-admin';

type SeedUser = {
  id: string;
  email: string;
  username: string;
  password: string;
  isAdmin: boolean;
};

describe('UsersController (e2e)', () => {
  jest.setTimeout(30000);

  let testingModule: TestingModule;
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;

  let adminAccessToken = '';
  let userAccessToken = '';

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

    users.admin = await seedUser({
      email: `admin-${suffix}@example.com`,
      password: 'AdminPass123!',
      username: `Admin ${suffix}`,
      isAdmin: true,
    });

    users.regular = await seedUser({
      email: `regular-${suffix}@example.com`,
      password: 'RegularPass123!',
      username: `Regular ${suffix}`,
    });

    users.lookup = await seedUser({
      email: `lookup-${suffix}@example.com`,
      password: 'LookupPass123!',
      username: `Lookup ${suffix}`,
    });

    users.toggle = await seedUser({
      email: `toggle-${suffix}@example.com`,
      password: 'TogglePass123!',
      username: `Toggle ${suffix}`,
    });

    users.delete = await seedUser({
      email: `delete-${suffix}@example.com`,
      password: 'DeletePass123!',
      username: `Delete ${suffix}`,
    });

    const adminLogin = await login(users.admin.email, users.admin.password);
    adminAccessToken = adminLogin.accessToken;

    const userLogin = await login(users.regular.email, users.regular.password);
    userAccessToken = userLogin.accessToken;
  });

  afterAll(async () => {
    await testingModule.get(DataSource).destroy();
    await app.close();
  });

  it('GET /api/users', async () => {
    const response = await request(httpServer)
      .get('/api/users')
      .query({ email: users.lookup.email })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.count).toBe(1);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        id: users.lookup.id,
        email: users.lookup.email,
        username: users.lookup.username,
      }),
    );
  });

  it('GET /api/users returns 403 for non-admin', async () => {
    await request(httpServer)
      .get('/api/users')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });

  it('GET /api/users/:id', async () => {
    const response = await request(httpServer)
      .get(`/api/users/${users.lookup.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: users.lookup.id,
        email: users.lookup.email,
        username: users.lookup.username,
      }),
    );
  });

  it('GET /api/users/:id returns 403 for non-admin', async () => {
    await request(httpServer)
      .get(`/api/users/${users.lookup.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });

  it('GET /api/users/:id returns 404 for unknown user', async () => {
    await request(httpServer)
      .get('/api/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  it('PATCH /api/users/:id', async () => {
    const newUsername = `Updated ${Date.now().toString(36)}`;
    const response = await request(httpServer)
      .patch(`/api/users/${users.regular.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ username: newUsername })
      .expect(200);

    expect(response.body).toEqual({
      id: users.regular.id,
      email: users.regular.email,
      username: newUsername,
      emailVerified: false,
      isAdmin: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('PATCH /api/users/:id returns 403 when editing another user', async () => {
    await request(httpServer)
      .patch(`/api/users/${users.lookup.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ username: 'Forbidden Update' })
      .expect(403);
  });

  it('PATCH /api/users/:id/toggle-admin', async () => {
    const response = await request(httpServer)
      .patch(`/api/users/${users.toggle.id}/toggle-admin`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: users.toggle.id,
        isAdmin: true,
      }),
    );
  });

  it('PATCH /api/users/:id/toggle-admin returns 403 for non-admin', async () => {
    await request(httpServer)
      .patch(`/api/users/${users.toggle.id}/toggle-admin`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });

  it('PATCH /api/users/:id/toggle-admin returns 404 for unknown user', async () => {
    await request(httpServer)
      .patch('/api/users/00000000-0000-0000-0000-000000000000/toggle-admin')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  it('PATCH /api/users/:id/toggle-admin returns 400 when toggling self', async () => {
    await request(httpServer)
      .patch(`/api/users/${users.admin.id}/toggle-admin`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(400);
  });

  it('ToggleAdmin use-case returns 403 for non-admin current user', async () => {
    const toggleAdmin = testingModule.get(ToggleAdmin);

    await expect(
      toggleAdmin.execute({
        id: users.toggle.id,
        currentUser: { id: users.regular.id, isAdmin: false } as any,
      }),
    ).rejects.toThrow("You don't have permission to execute this action");
  });

  it('DELETE /api/users/:id', async () => {
    const response = await request(httpServer)
      .delete(`/api/users/${users.delete.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual({ success: true });
  });

  it('DELETE /api/users/:id returns 403 when deleting another user', async () => {
    await request(httpServer)
      .delete(`/api/users/${users.lookup.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });

  it('DELETE /api/users/:id returns 200 when an admin delete another admin', async () => {
    const newAdmin = await seedUser({
      email: `admin-new@example.com`,
      password: 'AdminPass123!',
      username: `Admin New`,
      isAdmin: true,
    });
    await request(httpServer)
      .delete(`/api/users/${newAdmin.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });

  it('DELETE /api/users/:id returns 400 when deleting last admin', async () => {
    const userRepository = testingModule.get(UserRepository);
    await userRepository.deleteByCriteria({
      isAdmin: true,
      id: Not(users.admin.id),
    });
    await request(httpServer)
      .delete(`/api/users/${users.admin.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(400);
  });
});
