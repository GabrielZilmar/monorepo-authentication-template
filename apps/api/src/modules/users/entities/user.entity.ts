import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import PasswordUtils from '~/shared/password.util';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'varchar', length: 255 })
  passwordSalt: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async beforeInsert() {
    if (this.password) {
      const { passwordSalt, passwordHash } = await PasswordUtils.encrypt(
        this.password,
      );
      this.password = passwordHash;
      this.passwordSalt = passwordSalt;
    }
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }

  @BeforeUpdate()
  async setEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
}
