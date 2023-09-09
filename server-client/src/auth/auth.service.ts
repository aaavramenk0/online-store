import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import { SignInDto, SignUpDto } from './dto';
import { TypeTokenDecoded, TypeTokens } from '../types/token.d';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //Реєструємо нового користувача
  public async signUpLocal(dto: SignUpDto): Promise<TypeTokens> {
    try {
      //Перевіряємо чи є користувач з такими даними вже в базі даних
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      //Якщо такий користувач є, то повертаємо помилку
      if (existingUser?.id)
        throw new ConflictException('User is already exist', {
          description: 'auth/user-already-exist',
        });

      const hash = await this.hashData(dto.password);

      //Створюємо нового користувача
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          username:dto.username
        },
      });
      //Отримуємо токени та повертаємо їх

      const tokens = await this.getTokens(
        newUser.id,
        newUser.email,
        newUser.role,
        newUser.emailVerified,
      );
      await this.updateRtHash(newUser.id, tokens.refresh_token);


      return tokens;
    } catch (err) {
      this.generateErrorResponse(err, {
        message: 'Internal Error',
        description: 'auth/internal-error',
      });
    }
  }

  //Sign In with credentials, а саме за допомогою email та password
  public async signInLocal(dto: SignInDto): Promise<TypeTokens> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (!user)
        throw new NotFoundException('User not found', {
          description: 'auth/user-not-found',
        });

      if (!user?.hash)
        throw new BadRequestException('Password is not set', {
          description: 'auth/password-is-not-set-in-database',
        });

      const isPasswordsMatches = await bcrypt.compare(dto.password, user.hash);

      if (!isPasswordsMatches)
        throw new ForbiddenException("Passwords don't match", {
          description: 'auth/passwords-do-not-match',
        });

      const tokens = await this.getTokens(
        user.id,
        user.email,
        user.role,
        user.emailVerified,
      );

      await this.updateRtHash(user.id, tokens.refresh_token);

      return tokens
    } catch (err) {
      this.generateErrorResponse(err, {
        message: 'Internal Error',
        description: 'auth/internal-error',
      });
    }
  }

  //Реєстрація з гуглом
  public async signInWithGoogle(user: User | undefined) {
    try {
      if (!user)
        throw new UnauthorizedException('Unauthenticated', {
          description: 'auth/unauthenticated',
        });

      const userExists = await this.prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });

      if (!userExists) {
        const newUser = await this.prisma.user.create({
          data: user,
        });
        return await this.getTokens(
          newUser.id,
          newUser.email,
          newUser.role,
          userExists.emailVerified,
        );
      }

      return await this.getTokens(
        userExists.id,
        userExists.email,
        userExists.role,
        userExists.emailVerified,
      );
    } catch (err) {
      this.generateErrorResponse(err, {
        message: 'Internal Error',
        description: 'auth/internal-error',
      });
    }
  }

  public async signInWithTwitter(user: User | undefined) {
    try {
      if (!user) throw new UnauthorizedException('Unauthenticated');

      const userExists = await this.prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });

      if (!userExists) {
        const newUser = await this.prisma.user.create({
          data: user,
        });
        return await this.getTokens(
          newUser.id,
          newUser.email,
          newUser.role,
          userExists.emailVerified,
        );
      }

      return await this.getTokens(
        userExists.id,
        userExists.email,
        userExists.role,
        userExists.emailVerified,
      );
    } catch (err) {
      this.generateErrorResponse(err, {
        message: 'Internal Error',
        description: 'auth/internal-error',
      });
    }
  }

  public async logOut(userId: string) {
    try {
      const isUserExist = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!isUserExist)
        throw new NotFoundException('User not found', {
          cause: new Error(),
          description: 'auth/user-not-found',
        });
      await this.prisma.user.updateMany({
        where: {
          id: userId,
          hashedRt: {
            not: null,
          },
        },
        data: {
          hashedRt: null,
        },
      });
    } catch (err) {
      this.generateErrorResponse(err, {
        message: 'Failed to log out',
        description: 'auth/log-out-fail',
      });
    }
  }

  //Робить рефреш токенів
  public async refreshToken(rt: string): Promise<TypeTokens> {
    try {
      const tokenDecoded = this.jwtService.decode(rt) as TypeTokenDecoded;

      const now = Date.now() / 1000;

      //Якщо токен не є валідним, тобто його час експірації вичерпався, то повертаємо помилку
      if (tokenDecoded.exp < now) {
        throw new UnauthorizedException('Unauthorized', {
          cause: new Error(),
          description: 'Unauthorized',
        });
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: tokenDecoded.sub,
        },
      });

      if (!user)
        throw new NotFoundException('User not found', {
          description: 'auth/user-not-found',
        });

      if (!user?.hashedRt)
        throw new ForbiddenException('Cannot refresh tokens', {
          cause: 'User is log out',
          description: 'auth/refresh-error',
        });

      //Перевіряємо чи збігається наш рефреш токен, з тим що є в базі даних
      const rtMatches = await bcrypt.compare(rt, user.hashedRt);

      if (!rtMatches)
        throw new ForbiddenException('Access Denied.', {
          cause: 'Refresh token do not match with token in database',
          description: 'auth/invalid-token',
        });
      //Повертаємо нові токени
      const tokens = await this.getTokens(
        user.id,
        user.email,
        user.role,
        user.emailVerified ?? false,
      );
      await this.updateRtHash(user.id, tokens.refresh_token);
      return tokens;
    } catch (err) {
      this.generateErrorResponse(err, {
        message: 'Internal Error',
        description: 'auth/internal-error',
      });
    }
  }

  //Хешує дані
  private async hashData(data: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
  }

  //Оновлює властивість hashedRt в базі даних
  private async updateRtHash(userId: string, rt: string) {
    const hashedRt = await this.hashData(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt,
      },
    });
  }

  private async getTokens(
    userId: string,
    email: string,
    role: UserRole,
    emailVerified: boolean,
  ): Promise<TypeTokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
          emailVerified,
        },
        {
          expiresIn: '30m',
          secret: ACCESS_TOKEN_SECRET,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
          emailVerified,
        },
        {
          expiresIn: '7d',
          secret: REFRESH_TOKEN_SECRET,
        },
      ),
    ]);

    return { access_token: at, refresh_token: rt };
  }

  private generateErrorResponse(
    err: any,
    {
      message,
      description,
      cause,
    }: { message?: string; description?: string; cause?: string } = undefined,
  ) {
    if (err instanceof HttpException) {
      let description;

      if (typeof err.getResponse() === 'string') {
        description = err.getResponse();
      } else {
        const response = err.getResponse() as { error?: string };
        description = response?.error;
      }
      throw new HttpException(err.message, err.getStatus(), {
        description,
        cause: err.cause,
      });
    }
    throw new InternalServerErrorException(message, {
      description,
      cause,
    });
  }
}
