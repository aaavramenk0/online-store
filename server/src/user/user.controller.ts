import { Controller, HttpCode, HttpStatus, Get, UseGuards, Patch, Param, Body, Delete, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserGuard, Admin, TokenGuard } from 'src/common/guard';
import { PasswordResetDto, UpdateUserByAdminDto, UpdateUserDto } from './dto';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TypeGetUsersQuery } from './types';
import { Roles } from 'src/common/decorators';



@ApiTags('user')
@UseGuards(UserGuard)
@Controller('user')
export class UserController {
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
  @Admin(['Admin'])
  @Get('/get/all')
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
    description: "Access denied. You are trying to access another user's data."
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Roles(['Admin'])
  @UseGuards(TokenGuard)
  @Get('/get/:userId')
  @HttpCode(HttpStatus.OK)
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId)
  }

  @ApiParam({
    name: "userId",
    type: String
  })
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
  @UseGuards(TokenGuard)
  @Post('/:userId/email/verify/send')
  @HttpCode(HttpStatus.OK)
  sendVerificationCode(@Param('userId') userId: string) {
    return this.userService.sendEmailVerificationCode(userId)
  }

  @ApiParam({
    name: "userId",
    type: String
  })
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
  @UseGuards(TokenGuard)
  @Post("/:userId/password/reset")
  @HttpCode(HttpStatus.OK)
  sendPassword(@Param("userId") userId: string, @Body() dto: PasswordResetDto) {
    return this.userService.sendPasswordResetLink(userId, dto.link)
  }


  @ApiParam({
    name: "userId",
    type: String
  })
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
  @UseGuards(TokenGuard)
  @Patch('/:userId/email/verify')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Param("userId") userId: string, @Body('code') code: number) {
    return this.userService.verifyEmail(userId, code)
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
    description: "Access Denied. You are trying to update another user"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @UseGuards(TokenGuard)
  @Patch('/update/:userId')
  @HttpCode(HttpStatus.OK)
  updateUser(@Param("userId") userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUserInfo(dto, userId)
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
  @Admin(['Admin'])
  @Patch('/update/:userId')
  @HttpCode(HttpStatus.OK)
  updateUserByAdmin(@Param('userId') userId: string, @Body() dto: UpdateUserByAdminDto) {
    return this.userService.updateUserByAdmin(userId, dto)
  }



  //TODO: Додати функціонал зміни автара користувача
  @UseGuards(TokenGuard)
  @Patch("/update/:id/avatar")
  @HttpCode(HttpStatus.OK)
  updateUserAvatar(@Param("id") userId: string) {
    return this.userService.updateUserAvatar(userId)
  }


  @ApiParam({
    name: "id",
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
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
    description: "Access Denied. You are trying to delete another user"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @Roles(['Admin'])
  @UseGuards(TokenGuard)
  @Delete('/delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId)
  }
}



