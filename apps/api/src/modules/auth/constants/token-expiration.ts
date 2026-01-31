/**
 * Token expiration times in hours
 */
export const TOKEN_EXPIRATION = {
  EMAIL_VERIFICATION: 0.25, // 15 minutes
  PASSWORD_RESET: 1, // 1 hour
  REFRESH_TOKEN: 168, // 7 days
} as const;
