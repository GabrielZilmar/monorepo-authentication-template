import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from '~/modules/email/entities/email-template.entity';
import emailUseCasesProviders from '~/modules/email/use-cases/providers';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate])],
  providers: [...emailUseCasesProviders],
  exports: [...emailUseCasesProviders],
})
export class EmailModule {}
