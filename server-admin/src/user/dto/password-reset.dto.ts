import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsStrongPassword, IsUrl, MinLength } from "class-validator";


export class PasswordResetLinkDto {
  @ApiProperty({
    type: String,
    example: 'http://google.com',
    description: "Link to the password reset page"
  })
  @IsUrl()
  @IsNotEmpty()
  readonly link: string
}


export class PasswordResetDto {
  @ApiProperty({
    type: String, 
    example: 'q01Pl_25Skl',
    description:'New password'
  })
  @IsString()
  @IsStrongPassword({}, { message: "Password is too weak" })
  @MinLength(8, { message: 'The password must be at least 8 characters long' })
  @IsNotEmpty()
  readonly password?: string

}