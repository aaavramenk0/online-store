import { UserRole } from '@prisma/client';

export type TypeTokens = {
  access_token: string;
  refresh_token: string;
};

export type TypeTokenDecoded = {
  exp: number;
  iat?: number;
  email: string;
  sub: string;
  role: UserRole;
  emailVerified: boolean;
};
