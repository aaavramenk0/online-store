import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class PasswordResetDto {
  @ApiProperty({
    type: String,
    example: 'http://google.com',
    description:"Link to the password reset page"
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  readonly link: string
}