import { TypeGetUsersQuery } from './types';
import { Controller, Get, Query, HttpCode, HttpStatus, Param, Patch, Body, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/common/decorators';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto';
import { UserGuard } from 'src/common/guard';

@ApiTags('user')
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
  @Roles(['Admin'])
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
    description: "Access denied. You are trying to access another user's data"
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error"
  })
  @UseGuards(UserGuard)
  @Get('/get/:userId')
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
  @Patch('/update/:userId')
  @HttpCode(HttpStatus.OK)
  updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return { userId, dto }
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
  @Delete('/delete/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId)
  }
}
