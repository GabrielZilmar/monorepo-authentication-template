import { Injectable } from '@nestjs/common';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import { UseCase } from '~/shared/core/use-case';

interface LogoutParams {
  sessionId: string;
}

@Injectable()
export default class Logout implements UseCase<LogoutParams, void> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute({ sessionId }: LogoutParams): Promise<void> {
    await this.sessionRepository.deactivateSession(sessionId);
  }
}
