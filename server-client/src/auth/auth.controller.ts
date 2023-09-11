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
import { User } from '@prisma/client';
import { ApiBody, ApiTags, ApiResponse, ApiOAuth2 } from '@nestjs/swagger';

import { GetCurrentUserId } from 'src/common/decorators';
import { GoogleOauthGuard, TwitterGuard, RtGuard } from 'src/auth/guard';

import { AuthService } from './auth.service';
import { LogOutDto, SignInDto, SignUpDto } from './dto';

import { TOKENS } from '../constants';
import { AtGuard } from 'src/common/guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @ApiBody({
    type: SignUpDto
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has successfully registered'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exist'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignUpDto, @Res() res: Response) {
    const userData = await this.authService.signUpLocal(dto);

    res.cookie(TOKENS.ACCESS_TOKEN, userData.tokens.access_token, {
      httpOnly: false,
      maxAge: 1000 * 60 * 30,
    });
    res.cookie(TOKENS.REFRESH_TOKEN, userData.tokens.refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.send(userData);
  }


  @ApiBody({
    type: SignInDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The user has successfully logged in"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "User does not have an active password in the database"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Passwords don't match"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signInLocal(@Body() dto: SignInDto, @Res() res: Response) {
    const userData = await this.authService.signInLocal(dto);

    res.cookie(TOKENS.ACCESS_TOKEN, userData.tokens.access_token, {
      httpOnly: false,
      maxAge: 1000 * 60 * 30,
    });
    res.cookie(TOKENS.REFRESH_TOKEN, userData.tokens.refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.send(userData);
  }


  @ApiBody({
    type: LogOutDto,
    required: false
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The user has successfully logged out"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Post('log-out')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async logOut(@GetCurrentUserId() userId: string, @Res() res: Response, @Body() dto: LogOutDto) {
    res.clearCookie(TOKENS.ACCESS_TOKEN);
    res.clearCookie(TOKENS.REFRESH_TOKEN);

    await this.authService.logOut(userId);

    if (dto.redirectUrl) {
      return res.send({ message: "You have successfully logged out!" }).redirect(dto.redirectUrl)
    }

    return res.send({ message: "You have successfully logged out!" });
  }



  @ApiResponse({
    status: HttpStatus.OK,
    description: "Tokens have been successfully updated"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "The refresh token has expired OR User is not logged in",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Refresh token do not match with token in database"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Post('refresh')
  @UseGuards(RtGuard)
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


  @ApiOAuth2(["email", "profile"], 'Google')
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async signInWithGoogle() { }


  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has successfully logged in using Google'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "After the user has selected an account for registration, the user's data was not received"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @ApiOAuth2(["email", "profile"], 'Google')
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
  @UseGuards(TwitterGuard)
  @Get('twitter')
  async signInWithTwitter() { }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has successfully logged in using Twitter'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "After the user has selected an account for registration, the user's data was not received"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @ApiOAuth2(["email", "profile"], 'Twitter')
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
