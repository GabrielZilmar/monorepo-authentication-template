import { describe, it, expect, beforeEach } from '@jest/globals';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import Logout from './index';

describe('Logout Use Case', () => {
  let sessionRepository: jest.Mocked<SessionRepository>;
  let logout: Logout;

  beforeEach(() => {
    sessionRepository = {
      deactivateSession: jest.fn(),
    } as unknown as jest.Mocked<SessionRepository>;

    logout = new Logout(sessionRepository);
  });

  it('should deactivate the session', async () => {
    await logout.execute({ sessionId: 'session-id' });

    expect(sessionRepository.deactivateSession).toHaveBeenCalledWith('session-id');
  });
});
