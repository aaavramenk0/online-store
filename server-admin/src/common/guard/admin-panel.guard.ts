import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AdminPanelGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp()
    const req = ctx.getRequest<Request>()

    if (req.baseUrl.includes(process.env.ADMIN_PANEL_URL)) return true

    //TODO: Change this return from true to false
    return true
  }
}