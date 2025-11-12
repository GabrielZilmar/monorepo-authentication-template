import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginatedDTO {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  skip: number = 0;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  take: number = 10;
}

export class PaginatedResultDTO<T> {
  items: T[];
  count: number;
}
