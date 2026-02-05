/**
 * Token expiration times in hours
 */
export const TOKEN_EXPIRATION = {
  EMAIL_VERIFICATION: 0.25, // 15 minutes
  PASSWORD_RESET: 0.17, // 10 minutes
  ACCESS_TOKEN: 1, // 1h
  REFRESH_TOKEN: 168, // 7 days
} as const;
