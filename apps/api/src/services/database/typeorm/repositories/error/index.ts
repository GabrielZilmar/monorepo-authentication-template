import { HttpStatus } from '@nestjs/common';

export class RepositoryError extends Error {
  public readonly statusCode: number;
  public readonly payload?: unknown;
  public static messages = {
    createError: 'Could not create the item.',
    updateError: 'Could not update the item.',
    itemNotFound: 'Item not found.',
    itemDuplicated: (item: string) =>
      `Item${item && `: ${item}`} is duplicated.`,
    deleteError: 'Could not delete the item.',
    saveError: 'Could not save the items.',
    itemAlreadyExists: 'Item Already exists.',
  };

  constructor(message: string, statusCode: number, payload?: unknown) {
    super(message);
    this.payload = payload || null;
    this.statusCode = statusCode;
    this.name = 'repository-base';
  }

  public static create(
    message: string,
    payload?: unknown,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    return new RepositoryError(message, statusCode, payload);
  }
}
