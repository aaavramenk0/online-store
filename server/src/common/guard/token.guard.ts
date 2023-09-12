import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AtGuard } from './at.guard';
import { AdminTokenGuard } from './admin.guard';



@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private reflector: Reflector) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()

    const atGuard = new AtGuard(this.reflector)
    const adminTokenGuard = new AdminTokenGuard(this.reflector)

    const isAccessTokenValid = await atGuard.canActivate(context) && req.baseUrl.includes(process.env.CLIENT_URL)
    const isAdminTokenValid = await adminTokenGuard.canActivate(context) && req.baseUrl.includes(process.env.ADMIN_PANEL_URL)

    return isAccessTokenValid || isAdminTokenValid
  }
}