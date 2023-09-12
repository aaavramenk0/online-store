import { Controller, HttpCode, HttpStatus, Get, UseGuards, Patch, Param, Body, Delete, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { AtGuard, UserGuard } from 'src/common/guard';
import { PasswordResetDto, UpdateUserDto } from './dto';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';



@ApiTags('user')
@UseGuards(AtGuard,UserGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }


  @ApiParam({
    name: "id",
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
  @Get('/get/:id')
  @HttpCode(HttpStatus.OK)
  getUser(@Param('id') userId: string) {
    return this.userService.getUser(userId)
  }

  @ApiParam({
    name: "id",
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
  @Post('/:id/email/verify/send')
  @HttpCode(HttpStatus.OK)
  sendVerificationCode(@Param('id') userId: string) {
    return this.userService.sendEmailVerificationCode(userId)
  }

  @ApiParam({
    name: "id",
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
  @Post("/:id/password/reset")
  @HttpCode(HttpStatus.OK)
  sendPassword(@Param("id") userId: string, @Body() dto: PasswordResetDto) {
    return this.userService.sendPasswordResetLink(userId, dto.link)
  }


  @ApiParam({
    name: "id",
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
  @Patch('/:id/email/verify')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Param("id") userId: string, @Body('code') code: number) {
    return this.userService.verifyEmail(userId, code)
  }


  @ApiParam({
    name: "id",
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
  @Patch('/update/:id')
  @HttpCode(HttpStatus.OK)
  updateUser(@Param("id") userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUserInfo(dto, userId)
  }



  //TODO: Додати функціонал зміни автара користувача
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
  @Delete('/delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId)
  }
}



