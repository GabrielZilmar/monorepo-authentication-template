import * as crypto from 'crypto';

export default class CryptoUtils {
  public static generateToken(length: number = 32): {
    token: string;
    hashedToken: string;
  } {
    const token = crypto.randomBytes(length).toString('hex');
    const hashedToken = this.hashToken(token);
    return { token, hashedToken };
  }

  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public static compareToken(token: string, hashedToken: string): boolean {
    const tokenHash = this.hashToken(token);
    return crypto.timingSafeEqual(
      Buffer.from(tokenHash),
      Buffer.from(hashedToken),
    );
  }

  public static getTokenExpiry(hours: number = 24): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
  }

  public static isTokenExpired(expiry: Date | null): boolean {
    if (!expiry) return true;
    return new Date() > new Date(expiry);
  }
}
