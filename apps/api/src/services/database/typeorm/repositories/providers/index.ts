import { Provider } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import EmailTemplateRepository from '~/services/database/typeorm/repositories/email-template.repository';
import TokenRepository from '~/services/database/typeorm/repositories/token.repository';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';

const repositoriesProviders: Provider[] = [
  EntityManager,
  UserRepository,
  EmailTemplateRepository,
  TokenRepository,
  SessionRepository,
];

export default repositoriesProviders;
