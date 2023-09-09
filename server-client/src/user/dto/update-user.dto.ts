import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, MinLength } from "class-validator";
import {ApiPropertyOptional} from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiPropertyOptional({
    type: String,
    example: 'John Doe',
    description: "New username"
  })
  @IsString()
  @IsOptional()
  readonly username?: string

  @ApiPropertyOptional({
    type: String,
    example: "example@gmail.com",
    description: "New email address"
  })
  @IsString()
  @IsOptional()
  @IsEmail()
  readonly email?: string


  @ApiPropertyOptional({
    type: String, 
    example: 'q01Pl_25Skl',
    description:'New password'
  })
  @IsString()
  @IsStrongPassword({}, { message: "Password is too weak" })
  @MinLength(8, { message: 'The password must be at least 8 characters long' })
  @IsOptional()
  password?: string

  @ApiPropertyOptional({
    description: "Phone number",
    type: String,
    example:'+380 99 674 12 27'
  })
  @IsOptional()
  @IsPhoneNumber(null, {
    message: 'Please enter a valid phone number'
  })
  readonly phone?: string

}