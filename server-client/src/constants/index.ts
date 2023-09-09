import * as process from 'process';

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export enum TOKENS {
  ACCESS_TOKEN = 'euphoria:accessToken',
  REFRESH_TOKEN = 'euphoria:refreshToken',
}
