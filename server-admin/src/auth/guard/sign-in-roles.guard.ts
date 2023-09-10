import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    NotFoundException,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from "@prisma/client";

import { Request } from 'express';
import { SignInDto } from '../dto';

@Injectable()
export class SignInRolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const { email } = request?.body as SignInDto
       

        if (!email) throw new BadRequestException("Email is not provided")

        //Отримуємо дані з метаданих, які передаємо в декоратор Role
        const metadataRoles: UserRole[] = this.reflector.get<UserRole[]>('roles', context.getHandler());

        const roles: UserRole[] = metadataRoles?.length ? metadataRoles : ['Manager'];

        return this.checkUserRole(
            email,
            roles,
        );
    }

    private async checkUserRole(
        email: string,
        roles: UserRole[],
        message = 'server',
    ): Promise<boolean> {
        const user = await this.prisma.user.findUnique({ where: { email } });

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