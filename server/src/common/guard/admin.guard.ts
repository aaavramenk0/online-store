import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, SetMetadata, UseGuards, Injectable } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../decorators";
import { Observable } from "rxjs";

import { Request } from "express";
import { AuthGuard } from '@nestjs/passport';

export const Admin = (roles: UserRole[] = ['Admin', 'Manager']) => {
  Roles(roles)
  SetMetadata('Admin', true)
  //TODO: Додати до списку guards AdminPanelGuard
  return UseGuards(AdminTokenGuard)
}


@Injectable()
export class AdminPanelGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp()
    const req = ctx.getRequest<Request>()

    if (req.baseUrl.includes(process.env.ADMIN_PANEL_URL)) return true

    return false
  }
}


@Injectable()
export class AdminTokenGuard extends AuthGuard('jwt-admin') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context) as boolean;
  }
}