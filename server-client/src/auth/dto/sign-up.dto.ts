import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    type: String,
    example: 'example@gmail.com',
    description:"User's email address"
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    type: String,
    minLength: 8,
    example: 'q01Pl_25Skl',
    description:"User's password"
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(null, { message: "Password is too weak" })
  @MinLength(8, { message: 'The password must be at least 8 characters long' })
  readonly password: string;

  @ApiProperty({
    type: String,
    example: "John Doe",
    description:"User's name"
  })
  @IsNotEmpty()
  @IsString()
  readonly username: string;
}
