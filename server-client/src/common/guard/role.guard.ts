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

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

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

    //Перевіряємо чи існує користувач
    const userId = request?.user?.sub;
    if (!userId) return false;

    //Отримуємо дані з метаданих, які передаємо в декоратор Role
    const info = this.reflector.get<{
      roles?: string[];
      message?: string;
    }>('roles', context.getHandler());

    if (!info?.roles?.length) return true;

    return this.checkUserRole(
      userId,
      info.roles,
      info?.message ? info.message : 'server',
    );
  }

  private async checkUserRole(
    userId: string,
    roles: string[],
    message = 'server',
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(` User Not Found`, {
        cause: new Error(),
        description: `${message}/user-not-found`,
      });
    }
    //Перевіряємо чи роль користовувача збігається з вказаними ролями, та чи не є користувач адміном.
    if (!roles.some((role) => role === user.role) && user.role !== 'Admin') {
      throw new ForbiddenException(`Access Denied`, {
        cause: new Error(),
        description: `${message}/invalid-role`,
      });
    }

    return true;
  }
}
