import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from 'passport-jwt'
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UserRole} from "@prisma/client";
import {Request} from "express";

import {TOKEN_SECRET, TOKENS} from "../../constants";
import {PrismaService} from "../../prisma/prisma.service";

type TypeJwtPayload = {
    sub: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
};
@Injectable()
export class AtStrategy extends  PassportStrategy(Strategy, 'jwt') {
    constructor(private prisma : PrismaService) {
        const extractJwtFromCookie = (req: Request) => {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies?.[TOKENS.TOKEN];
            }
            return token ?? ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        };
        super({
            secretOrKey: TOKEN_SECRET,
            ignoreExpiration:false,
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
        console.log(user)
        if (!user) throw new UnauthorizedException('Unauthorized');

        return payload;
    }
}