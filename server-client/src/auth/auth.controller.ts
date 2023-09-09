import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { GetCurrentUserId, Public } from 'src/common/decorators';
import { GoogleOauthGuard, TwitterGuard } from 'src/auth/guard';
import { User } from '@prisma/client';

import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';

import { TOKENS } from '../constants';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }


  @ApiBody({
    type: SignUpDto
  })
  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignUpDto, @Res() res: Response) {
    const tokens = await this.authService.signUpLocal(dto);

    res.cookie(TOKENS.ACCESS_TOKEN, tokens.access_token, {
      httpOnly: false,
      maxAge: 1000 * 60 * 30,
    });
    res.cookie(TOKENS.REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.send(tokens);
  }

  @ApiBody({
    type: SignInDto,
  })
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signInLocal(@Body() dto: SignInDto, @Res() res: Response) {
    const tokens = await this.authService.signInLocal(dto);

    res.cookie(TOKENS.ACCESS_TOKEN, tokens.access_token, {
      httpOnly: false,
      maxAge: 1000 * 60 * 30,
    });
    res.cookie(TOKENS.REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.send(tokens);
  }


  @Post('log-out')
  @HttpCode(HttpStatus.OK)
  async logOut(@GetCurrentUserId() userId: string, @Res() res: Response) {
    res.clearCookie(TOKENS.ACCESS_TOKEN);
    res.clearCookie(TOKENS.REFRESH_TOKEN);

    const result = await this.authService.logOut(userId);
    return res.send(result);
  }


  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.[TOKENS.REFRESH_TOKEN];
    if (refreshToken) {
      const tokens = await this.authService.refreshToken(refreshToken);
      res.cookie(TOKENS.REFRESH_TOKEN, tokens.refresh_token, {
        maxAge: 604800 * 1000,
        httpOnly: true,
      });
      res.cookie(TOKENS.ACCESS_TOKEN, tokens.access_token, {
        httpOnly: false,
        maxAge: 1000 * 60 * 30,
      });
      return res.send(tokens);
    } else {
      return res.status(401).send({ message: 'Unauthorized', status: 401 });
    }
  }

  //Auth with Google
  @Public()
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async signInWithGoogle() { }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.signInWithGoogle(req.user as User);

    res.cookie(TOKENS.ACCESS_TOKEN, tokens.access_token, {
      httpOnly: false,
      maxAge: 1000 * 60 * 30,
    });
    res.cookie(TOKENS.REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.send(tokens);
  }

  //Auth with Twitter
  //TODO: Зробити, щоб запрацювало.
  @Public()
  @UseGuards(TwitterGuard)
  @Get('twitter')
  async signInWithTwitter() { }

  @Public()
  @UseGuards(TwitterGuard)
  @Get('twitter/callback')
  async twitterCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.signInWithTwitter(req.user as User);

    res.cookie(TOKENS.ACCESS_TOKEN, tokens.access_token, {
      httpOnly: false,
      maxAge: 1000 * 60 * 30,
    });
    res.cookie(TOKENS.REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.send(tokens);
  }
}
