import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import {APP_GUARD} from "@nestjs/core";
import {AtGuard, RolesGuard} from "./common/guard";
import { UserModule } from './user/user.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }),
    PrismaModule,
    AuthModule,
    UserModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass:AtGuard
    },
    {
      provide: APP_GUARD,
      useClass:RolesGuard
    }
  ]
})
export class AppModule { }
