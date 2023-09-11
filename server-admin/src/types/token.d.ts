import { UserRole } from '@prisma/client';

export type TypeTokenDecoded = {
    exp: number;
    iat?: number;
    email: string;
    sub: string;
    role: UserRole;
    emailVerified: boolean;
};