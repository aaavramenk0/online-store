import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

import { PrismaService } from 'src/prisma/prisma.service';

import { ACCESS_TOKEN_SECRET } from '../../constants';
import { TOKENS } from '../../constants';

type TypeJwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
};
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    const extractJwtFromCookie = (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies[TOKENS.ACCESS_TOKEN];
      }
      return token ?? ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };
    super({
      secretOrKey: ACCESS_TOKEN_SECRET,
      ignoreExpiration: false,
      jwtFromRequest: extractJwtFromCookie,
    });
  }
  async validate(payload: TypeJwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
        id: payload.sub,
        emailVerified: payload.emailVerified,
        role: payload.role,
      },
    });
    if (!user) throw new UnauthorizedException('Unauthorized');

    return payload;
  }
}
