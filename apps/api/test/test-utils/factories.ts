import { Token, TokenType } from '~/modules/tokens/entities/token.entity';
import { Session } from '~/modules/auth/entities/session.entity';
import { User } from '~/modules/users/entities/user.entity';

export const buildUser = (overrides: Partial<User> = {}): User => {
  return {
    id: 'user-id',
    email: 'user@example.com',
    username: 'Test User',
    isAdmin: false,
    password: 'hashed-password',
    passwordSalt: 'salt',
    emailVerified: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    ...overrides,
  } as User;
};

export const buildSession = (overrides: Partial<Session> = {}): Session => {
  return {
    id: 'session-id',
    userId: 'user-id',
    user: buildUser(),
    refreshToken: 'hashed-refresh-token',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    isActive: true,
    userAgent: null,
    ipAddress: null,
    lastUsedAt: new Date('2024-01-03T00:00:00.000Z'),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    ...overrides,
  } as Session;
};

export const buildToken = (overrides: Partial<Token> = {}): Token => {
  return {
    id: 'token-id',
    userId: 'user-id',
    user: buildUser(),
    type: TokenType.EMAIL_VERIFICATION,
    hashedToken: 'hashed-token',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    used: false,
    usedAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  } as Token;
};
