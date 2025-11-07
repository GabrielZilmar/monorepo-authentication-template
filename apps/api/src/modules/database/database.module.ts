import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppDataSource } from '~/services/database/typeorm/config/data-source';

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        await AppDataSource.initialize();
        return AppDataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
