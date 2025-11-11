import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { AppDataSource } from '~/services/database/typeorm/config/data-source';

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        await AppDataSource.initialize();
        await runSeeders(AppDataSource);

        return AppDataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
