import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  EmailTemplate,
  EmailTemplateType,
} from '~/modules/email/entities/email-template.entity';
import { BaseRepository } from '~/services/database/typeorm/repositories/base/base-repository';

@Injectable()
export default class EmailTemplateRepository extends BaseRepository<EmailTemplate> {
  constructor(entityManager?: EntityManager) {
    super({ entity: EmailTemplate, uniqueFields: ['type'], entityManager });
  }

  async findByType(type: EmailTemplateType): Promise<EmailTemplate | null> {
    return this.findOneByCriteria({ type, isActive: true });
  }

  async findAllTemplates(): Promise<EmailTemplate[]> {
    const { items } = await this.find({
      order: { createdAt: 'DESC' },
    });
    return items;
  }

  async findActive(): Promise<EmailTemplate[]> {
    const { items } = await this.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    return items;
  }

  async countActive(): Promise<number> {
    return this.repository.count({
      where: { isActive: true },
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }

  async activate(id: string): Promise<void> {
    await this.repository.update(id, { isActive: true });
  }
}
