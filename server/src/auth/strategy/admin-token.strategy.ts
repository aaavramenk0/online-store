import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Request } from "express";

import { ADMIN_TOKEN_SECRET, TOKENS } from "../../constants";
import { PrismaService } from "../../prisma/prisma.service";

type TypeJwtPayload = {
    sub: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
};
@Injectable()
export class AdminTokenStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
    constructor(private prisma: PrismaService) {
        const extractJwtFromCookie = (req: Request) => {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies?.[TOKENS.ADMIN_TOKEN];
            }
            return token ?? ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        };
        super({
            secretOrKey: ADMIN_TOKEN_SECRET,
            ignoreExpiration: false,
            jwtFromRequest: extractJwtFromCookie
        })
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