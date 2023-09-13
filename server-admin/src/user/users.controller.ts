import { TypeGetUsersQuery } from './types';
import { Controller, Get, Query, HttpCode, HttpStatus, Param, Patch, Body, Delete, UseGuards, Post } from '@nestjs/common';
import { UserService } from './users.service';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PasswordResetDto, PasswordResetLinkDto, UpdateUserDto } from './dto';
import { UserGuard } from 'src/common/guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) { }

  @ApiResponse({
    status: HttpStatus.OK,
    description: "Users successfully received"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Access denied. Only the admin can receive all users"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Roles(['Admin'])
  @Get('/all')
  @HttpCode(HttpStatus.OK)
  getUsers(@Query() query: TypeGetUsersQuery) {
    return this.userService.getUsers(query)
  }


  @ApiParam({
    name: "userId",
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User successfully received"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Access denied. You are trying to access another user's data"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @UseGuards(UserGuard)
  @Get('/:userId')
  @HttpCode(HttpStatus.OK)
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId)
  }

  @ApiParam({
    name: "userId",
    type: String
  })
  @ApiBody({
    type: UpdateUserDto
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "You have successfully updated your profile"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid data OR Failed to validate data"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Access denied. Only the admin can update a user"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Roles(['Admin'])
  @Patch('/:userId')
  @HttpCode(HttpStatus.OK)
  updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return { userId, dto }
  }


  @ApiResponse({
    status: HttpStatus.OK,
    description: "You have successfully verified your email address"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Access Denied. You are trying to verify another user's email address"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Patch('/email/verify')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@GetCurrentUserId() userId: string, @Body('code') code: number) {
    return this.userService.verifyEmail(userId, code)
  }


  @ApiResponse({
    status: HttpStatus.OK,
    description: "The email with verification code was sent successfully"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Access denied.You are trying to send an email with a verification code to another user"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Post('/email/verify/send')
  @HttpCode(HttpStatus.OK)
  sendVerificationCode(@GetCurrentUserId() userId: string) {
    return this.userService.sendEmailVerificationCode(userId)
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: "The email with password reset link was sent successfully"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Access denied.You are trying to send an email with a verification code to another user"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Post("/password/reset")
  @HttpCode(HttpStatus.OK)
  sendPassword(@GetCurrentUserId() userId: string, @Body() dto: PasswordResetLinkDto) {
    return this.userService.sendPasswordResetLink(userId, dto.link)
  }


  @Patch('password/update')
  @HttpCode(HttpStatus.OK)
  resetPassword(@GetCurrentUserId() userId: string, @Body() dto : PasswordResetDto) {
    return this.userService.resetPassword(userId, dto)
  }



  @ApiParam({
    name: "userId",
    type: String
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "You have successfully delete your profile"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid user id"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Access denied. Only the admin can delete a user"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Roles(['Admin'])
  @Delete('/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId)
  }
}
