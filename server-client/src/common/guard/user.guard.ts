import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import { TOKENS } from '../../constants';
import { TypeTokenDecoded } from '../../types/token.d';



@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {

  }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()


    const { id: userId } = request.params


    if (!userId) return false



    const token = request.cookies?.[TOKENS.REFRESH_TOKEN] ?? request.headers.authorization.split(' ')[1]

    if (!token) return false

    const isTokenValid = await this.jwtService.verify(token)

    if (!isTokenValid) return false

    const { sub } = this.jwtService.decode(token) as TypeTokenDecoded



    if (!sub) return false


    if (sub !== userId) return false

    return true
  }
} 