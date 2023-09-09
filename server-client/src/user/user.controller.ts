import { Controller, Get, UseGuards, Patch, Param, Body, Delete, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { AtGuard, UserGuard } from 'src/common/guard';
import { PasswordResetDto, UpdateUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@UseGuards(AtGuard, UserGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }


  @Get('/:id')
  getUser(@Param('id') userId: string) {
    return this.userService.getUser(userId)
  }

  @Post('/:id/email/verify/send')
  sendVerificationCode(@Param('id') userId: string) {
    return this.userService.sendEmailVerificationCode(userId)
  }

  @Post("/:id/password/reset")
  sendPassword(@Param("id") userId: string, @Body() dto: PasswordResetDto) {
    return this.userService.sendPasswordResetLink(userId, dto.link)
  }

  @Patch('/:id/email/verify')
  verifyEmail(@Param("id") userId: string, @Body('code') code: number) {
    return this.userService.verifyEmail(userId, code)
  }


  @Patch('/:id')
  updateUser(@Param("id") userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUserInfo(dto, userId)
  }

  @Delete('/:id')
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId)
  }
}



