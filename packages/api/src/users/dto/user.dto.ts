export class UserDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly isAdmin: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
