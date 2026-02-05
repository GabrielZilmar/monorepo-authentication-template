import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailTemplateType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  WELCOME = 'welcome',
  PASSWORD_CHANGED = 'password_changed',
}

@Entity('email_templates')
@Index(['type', 'isActive'])
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EmailTemplateType,
    unique: true,
  })
  type: EmailTemplateType;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  htmlTemplate: string;

  @Column({ type: 'text', nullable: true })
  textTemplate: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
