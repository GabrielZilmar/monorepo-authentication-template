import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginatedDTO {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  perPage: number = 10;
}

export class PaginatedResultDTO<T> {
  items: T[];
  count: number;
}
