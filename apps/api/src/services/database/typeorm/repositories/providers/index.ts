import { Provider } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';

const repositoriesProviders: Provider[] = [EntityManager, UserRepository];

export default repositoriesProviders;
