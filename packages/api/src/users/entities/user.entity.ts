export class UserEntity {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  password: string;
  passwordSalt: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
