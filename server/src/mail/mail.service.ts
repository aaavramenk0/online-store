import {
  Injectable,

  InternalServerErrorException,
  BadRequestException
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer/dist';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(
    private mailer: MailerService,
  ) { }

  public async sendEmailVerificationCode(user: User, code: number) {
    if (!user)
      throw new BadRequestException('User not specified', {
        description: 'mailer/user-not-specified',
      });
    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Welcome to Euphoria Shop! Please, confirm your Email',
        template: './emailVerification.hbs',
        context: {
          code,
          name: user.username,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err?.message ?? 'Internal Error', {
        description: 'mailer/internal-error',
      });
    }
  }

  public async sendPasswordResetLink(user: User, link: string) {
    if (!user)
      throw new BadRequestException('User not specified', {
        description: 'mailer/user-not-specified',
      });
    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Here is the link to the password reset',
        template: './passwordReset.hbs',
        context: {
          link,
          name: user.username,
        },
      })
    } catch (err) {
      throw new InternalServerErrorException(err?.message ?? 'Internal Error', {
        description: 'mailer/internal-error',
      });
    }
  }
}
