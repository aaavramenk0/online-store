import { UserRole } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";



export class UpdateUserDto {
  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole
}