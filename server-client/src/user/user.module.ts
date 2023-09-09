import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from 'src/mail/mail.module';



@Module({
  imports: [MailModule],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule { }
