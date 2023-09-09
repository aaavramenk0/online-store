import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const Roles = (info: { roles: UserRole[]; message?: string }) =>
  SetMetadata('roles', info);
