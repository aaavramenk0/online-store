import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from "@nestjs/core";

import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TokenGuard, RolesGuard, AdminPanelGuard } from "./common/guard";
import { UserModule } from './user/users.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),
    PrismaModule,
    AuthModule,
    UserModule, MailModule, CloudinaryModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TokenGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_GUARD,
      useClass: AdminPanelGuard
    }
  ]
})
export class AppModule { }
