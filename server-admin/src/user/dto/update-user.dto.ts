import { UserRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";



export class UpdateUserDto {
  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole

  @IsOptional()
  @IsString()
  readonly username?: string
}