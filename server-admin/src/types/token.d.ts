import { UserRole } from '@prisma/client';

export type TypeTokens = {
    token: string;
};

export type TypeTokenDecoded = {
    exp: number;
    iat?: number;
    email: string;
    sub: string;
    role: UserRole;
    emailVerified: boolean;
};