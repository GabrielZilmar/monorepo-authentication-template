export class UserEntity {
  id: string;
  email: string;
  username: string;
  password: string;
  passwordSalt: string;
  createdAt: Date;
  updatedAt: Date;
}
