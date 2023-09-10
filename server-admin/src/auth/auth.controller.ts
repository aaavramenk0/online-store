import { Body, Controller, Post, Res, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { Response } from 'express'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { TOKENS } from 'src/constants';

import { Public } from '../common/decorators/public.decorator';
import { AuthService } from "./auth.service";
import { LogOutDto, SignInDto } from './dto';
import { SignInRolesGuard } from './guard/sign-in-roles.guard';





@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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
        description: "Passwords don't match OR Invalid role"
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "Internal Server Error"
    })
    @Public()
    @UseGuards(SignInRolesGuard)
    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() dto: SignInDto, @Res() res: Response) {
        const { token } = await this.authService.signIn(dto)

        res.cookie(TOKENS.TOKEN, token, {
            httpOnly: true,
            //TODO: Змінити це значення, на термін дії токена
            maxAge: 1000 * 60 * 30
        })

        return res.send({ token })
    }


    @ApiBody({
        type: LogOutDto,
    })
    @ApiResponse({
        status: 302,
        description: "The user has successfully logged out"
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: "Unauthorized"
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: "User not found"
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: "Invalid role"
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "Internal Server Error"
    })
    @Post('log-out')
    @HttpCode(HttpStatus.OK)
    logOut(@Res() res: Response, @Body() dto: LogOutDto) {
        res.clearCookie(TOKENS.TOKEN)

        return res.send({ message: "You have successfully logged out!" }).redirect(dto.redirectUrl)
    }
}
