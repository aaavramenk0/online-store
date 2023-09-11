import {
    BadRequestException, ForbiddenException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { SignInDto } from "./dto/sign-in.dto";
import { generateErrorResponse } from "../helpers";
import * as bcrypt from 'bcrypt'
import { User, UserRole } from "@prisma/client";
import { TOKEN_SECRET } from "../constants";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) { }

    public async signIn(dto: SignInDto): Promise<{ token: string, user: User }> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email
                }
            })
            if (!user) throw new NotFoundException("User not found", { description: "auth/user-not-found" })

            if (!user?.hash)
                throw new BadRequestException('Password is not set', {
                    description: 'auth/password-is-not-set-in-database',
                });

            const isPasswordsMatches = await bcrypt.compare(dto.password, user.hash);


            if (!isPasswordsMatches)
                throw new ForbiddenException("Passwords don't match", {
                    description: 'auth/passwords-do-not-match',
                });

            const token = await this.getToken(
                user.id,
                user.email,
                user.role,
                user.emailVerified,
            );
            return {
                token,
                user
            }
        } catch (err) {
            throw generateErrorResponse(err, { description: 'auth/internal-error' })
        }
    }

    private async getToken(userId: string,
        email: string,
        role: UserRole,
        emailVerified: boolean): Promise<string> {
        const [token] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                    role,
                    emailVerified,
                },
                {
                    expiresIn: '30m',
                    secret: TOKEN_SECRET,
                },
            ),
        ]);

        return token;
    }

}
