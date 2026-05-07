import { HttpStatus } from '@nestjs/common';
import { isUUID } from 'class-validator';
import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AppDataSource } from '~/services/database/typeorm/config/data-source';
import { RepositoryError } from '~/services/database/typeorm/repositories/error';
import {
  IRead,
  IWrite,
} from '~/services/database/typeorm/repositories/interfaces/interfaces';

type ConstructorParams<T> = {
  entity: EntityTarget<T>;
  uniqueFields?: (keyof T)[];
  entityManager?: EntityManager;
};

export abstract class BaseRepository<T extends { id: string }>
  implements IWrite<T>, IRead<T>
{
  protected readonly uniqueFields: (keyof T)[] = [];
  public readonly repository: Repository<T>;

  constructor({
    entity,
    uniqueFields = [],
    entityManager,
  }: ConstructorParams<T>) {
    this.uniqueFields = uniqueFields;
    if (entityManager?.connection?.isInitialized) {
      this.repository = entityManager.getRepository(entity);
      return;
    }
    this.repository = AppDataSource.getRepository(entity);
  }

  protected async preventDuplicatedItemByFields(
    item: Partial<T> | DeepPartial<T> | QueryDeepPartialEntity<T>,
    id?: string,
  ): Promise<void> {
    for (const field of this.uniqueFields) {
      const value = (item as Record<string, unknown>)[field as string];
      if (!value) continue;

      const existing = await this.repository.findOneBy({
        [field]: value,
      } as FindOptionsWhere<T>);
      if (existing) {
        const isSameUser = existing.id === id;
        if (!isSameUser) {
          throw RepositoryError.create(
            RepositoryError.messages.itemDuplicated(
              `${this.repository.metadata.targetName}.${field.toString()}`,
            ),
            { field, value },
            HttpStatus.CONFLICT,
          );
        }
      }
    }
  }

  private async preventInexistentItem(id: string): Promise<boolean> {
    try {
      const itemExist = await this.findOneById(id);

      if (!itemExist) {
        throw RepositoryError.create(
          RepositoryError.messages.itemNotFound,
          { id },
          HttpStatus.BAD_REQUEST,
        );
      }

      return true;
    } catch (err) {
      throw RepositoryError.create((err as Error).message);
    }
  }

  async create(item: DeepPartial<T>): Promise<T> {
    if (this.uniqueFields.length) {
      await this.preventDuplicatedItemByFields(item);
    }
    const itemToSave = this.repository.create({ ...item });
    return this.save(itemToSave);
  }

  async update(id: string, item: QueryDeepPartialEntity<T>): Promise<boolean> {
    await this.preventInexistentItem(id);
    if (this.uniqueFields.length) {
      await this.preventDuplicatedItemByFields(item, id);
    }
    try {
      const newItem = await this.repository.update(id, item);
      if (!newItem) {
        throw RepositoryError.create(RepositoryError.messages.updateError);
      }

      return true;
    } catch (err) {
      throw RepositoryError.create((err as Error).message);
    }
  }

  async updateAndReturn(
    id: string,
    item: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    await this.preventInexistentItem(id);
    if (this.uniqueFields.length) {
      await this.preventDuplicatedItemByFields(item, id);
    }

    const itemExist = await this.findOneById(id);
    if (!itemExist) {
      throw RepositoryError.create(
        RepositoryError.messages.itemNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const updatedItem = Object.assign(itemExist, item);
      return this.repository.save(updatedItem);
    } catch (err) {
      throw RepositoryError.create((err as Error).message);
    }
  }

  async delete(id: string): Promise<boolean> {
    await this.preventInexistentItem(id);

    try {
      await this.repository.delete(id);
    } catch (err) {
      throw RepositoryError.create((err as Error).message);
    }

    return true;
  }

  async deleteByCriteria(criteria: FindOptionsWhere<T>): Promise<boolean> {
    try {
      await this.repository.delete(criteria);
    } catch (err) {
      throw RepositoryError.create((err as Error).message);
    }

    return true;
  }

  async save(item: T | DeepPartial<T>): Promise<T> {
    try {
      return this.repository.save(item);
    } catch (err) {
      throw RepositoryError.create((err as Error).message);
    }
  }

  async saveMany(items: T[] | DeepPartial<T[]>): Promise<T[]> {
    try {
      return this.repository.save(items);
    } catch (err) {
      if ((err as Error).message.includes('duplicate key')) {
        throw RepositoryError.create(
          RepositoryError.messages.itemAlreadyExists,
          { error: (err as Error).name, message: (err as Error).message },
          HttpStatus.CONFLICT,
        );
      }
      throw RepositoryError.create((err as Error).message);
    }
  }

  async findAll(
    skip?: number,
    take?: number,
  ): Promise<{ items: T[]; count: number }> {
    const [items, count] = await this.repository.findAndCount({
      skip,
      take,
    });

    return { items, count };
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async find(
    options?: FindManyOptions<T>,
  ): Promise<{ items: T[]; count: number }> {
    const [items, count] = await this.repository.findAndCount({
      ...options,
    });

    return { items, count };
  }

  async findOneByCriteria(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T | null> {
    return this.repository.findOneBy(criteria);
  }

  async findOneById(id: string): Promise<T | null> {
    const criteria = { id } as FindOptionsWhere<T>;

    return this.repository.findOneBy(criteria);
  }

  public genericMountSearch(
    params: Record<string, string | number>,
  ): FindOptionsWhere<T> {
    const search: FindOptionsWhere<T> = Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (typeof value === 'string') {
          if (isUUID(value)) {
            return {
              ...acc,
              [key]: value,
            };
          }
          return {
            ...acc,
            [key]: ILike(`%${value}%`),
          };
        }
        if (typeof value === 'number') {
          return {
            ...acc,
            [key]: value,
          };
        }

        return acc;
      },
      {} as FindOptionsWhere<T>,
    );

    return search;
  }
}
