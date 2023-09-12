import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypeTokenDecoded } from 'src/types/token';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    //Перевіряємо чи endpoint є публічним. Якщо так , то перевірку на ролі не робимо.
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    
    const metadataRoles: UserRole[] = this.reflector.get<UserRole[]>('roles', context.getHandler());
    const roles: UserRole[] = metadataRoles?.length ? metadataRoles : [];

    if (!roles?.length) return true;

    //Перевіряємо чи існує користувач
    const user = request?.user as TypeTokenDecoded;
    const userId = user?.sub

    if (!userId) return false;

    //Отримуємо дані з метаданих, які передаємо в декоратор Role


    return this.checkUserRole(
      userId,
      roles,
    );
  }

  private async checkUserRole(
    userId: string,
    roles: UserRole[],
    message = 'server',
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(` User Not Found`, {
        description: `${message}/user-not-found`,
      });
    }
    //Перевіряємо чи роль користовувача збігається з вказаними ролями, та чи не є користувач адміном.
    if (!roles.some((role) => role === user.role) && user.role !== 'Admin') {
      throw new ForbiddenException(`Access Denied`, {
        description: `${message}/invalid-role`,
      });
    }

    return true;
  }
}
