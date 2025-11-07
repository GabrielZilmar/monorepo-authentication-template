import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '~/modules/users/entities/user.entity';
import { BaseRepository } from '~/services/database/typeorm/repositories/base/base-repository';

@Injectable()
export default class UserRepository extends BaseRepository<User> {
  constructor(entityManager?: EntityManager) {
    super({ entity: User, uniqueFields: ['email'], entityManager });
  }

  async findByEmail(email: string, withDeleted = false): Promise<User | null> {
    return this.findOne({
      where: { email },
      withDeleted,
    });
  }
}
