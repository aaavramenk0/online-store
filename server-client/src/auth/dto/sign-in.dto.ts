import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
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
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'The password must be at least 8 characters long' })
  readonly password: string;
}
