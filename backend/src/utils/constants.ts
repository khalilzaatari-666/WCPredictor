export const GROUPS = {
  A: ['Qatar', 'Ecuador', 'Senegal', 'Netherlands'],
  B: ['England', 'Iran', 'USA', 'Wales'],
  C: ['Argentina', 'Saudi Arabia', 'Mexico', 'Poland'],
  D: ['France', 'Australia', 'Denmark', 'Tunisia'],
  E: ['Spain', 'Costa Rica', 'Germany', 'Japan'],
  F: ['Belgium', 'Canada', 'Morocco', 'Croatia'],
  G: ['Brazil', 'Serbia', 'Switzerland', 'Cameroon'],
  H: ['Portugal', 'Ghana', 'Uruguay', 'South Korea'],
  I: ['Italy', 'Albania', 'Turkey', 'Czech Republic'],
  J: ['Colombia', 'Egypt', 'Peru', 'Paraguay'],
  K: ['Nigeria', 'Chile', 'Sweden', 'Austria'],
  L: ['Ukraine', 'Scotland', 'Norway', 'Greece'],
};

export const GROUP_NAMES = Object.keys(GROUPS);

export const PAYMENT_AMOUNT = 19.99;
export const PAYMENT_CURRENCY = 'MAD';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const TOKEN_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY = '30d';

export const REDIS_KEYS = {
  USER_SESSION: (userId: string) => `session:${userId}`,
  BLACKLIST_TOKEN: (token: string) => `blacklist:${token}`,
  PREDICTION_CACHE: (id: string) => `prediction:${id}`,
  LEADERBOARD: 'leaderboard',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};