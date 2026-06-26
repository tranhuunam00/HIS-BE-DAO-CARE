export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
  STAGING = 'staging',
}

export const GLOBAL_LIMITS = {
  PUBLIC_RATE_LIMIT_TTL: 60 * 15, // 15 minutes
  PUBLIC_RATE_LIMIT_MAX: 100, // 100 requests per 15 minutes
  SENSITIVE_RATE_LIMIT_TTL: 60, // 1 minute
  SENSITIVE_RATE_LIMIT_MAX: 5, // 5 requests per 1 minute
};

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DOMAIN_ERROR: 'DOMAIN_ERROR',
};

export const DEFAULT_COUNTRY_CODE = 'VN';
export const DEFAULT_CURRENCY_CODE = 'VND';
