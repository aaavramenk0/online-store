import { ApiProperty } from '@nestjs/swagger';
import { IsOptional,  IsUrl } from "class-validator";


export class LogOutDto {
  @ApiProperty({
    example: 'http://localhost:3000/sign-in',
    description: "The url to which the user will be redirected after logging out",
    type: String,
    required:false
  })
  @IsOptional()
  @IsUrl()
  readonly redirectUrl?:string
}