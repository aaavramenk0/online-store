import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import {APP_GUARD} from "@nestjs/core";
import {AtGuard, RolesGuard} from "./common/guard";


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }),
    PrismaModule,
    AuthModule],
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
