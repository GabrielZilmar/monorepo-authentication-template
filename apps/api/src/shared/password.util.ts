import * as bcrypt from 'bcrypt';

type ComparePasswordParams = {
  password: string;
  passwordHashed: string;
};

export default class PasswordUtils {
  public static async encrypt(password: string): Promise<{
    passwordHash: string;
    passwordSalt: string;
  }> {
    const saltRounds = 10;
    const passwordSalt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    return { passwordHash, passwordSalt };
  }

  public static async compare({
    password,
    passwordHashed,
  }: ComparePasswordParams) {
    return bcrypt.compare(password, passwordHashed);
  }
}
