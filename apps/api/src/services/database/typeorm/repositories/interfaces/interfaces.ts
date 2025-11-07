import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IWrite<T> {
  create(item: T): Promise<T>;
  update(id: string, item: QueryDeepPartialEntity<T>): Promise<boolean>;
  updateAndReturn(id: string, item: QueryDeepPartialEntity<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  save(items: T | DeepPartial<T>): Promise<T>;
}

export interface IRead<T> {
  find(options?: FindManyOptions<T>): Promise<{ items: T[]; count: number }>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findAll(): Promise<{ items: T[]; count: number }>;
  findOneByCriteria(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T | null>;
  findOneById(id: string): Promise<T | null>;
}
