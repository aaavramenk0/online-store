import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUrl } from "class-validator";

export class LogOutDto {
  @ApiProperty({
    example: 'http://localhost:3000/sign-in',
    description: "The url to which the user will be redirected after logging out",
    type: String
  })
  @IsUrl()
  @IsNotEmpty()
  readonly redirectUrl: string
}