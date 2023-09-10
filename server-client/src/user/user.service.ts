import { HttpException, Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'

import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

import { PrismaService } from 'src/prisma/prisma.service';

import { UpdateUserDto } from './dto';
import { MailService } from 'src/mail/mail.service';
import { Job, scheduleJob } from 'node-schedule';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';



@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private mailer: MailService, private cloudinary: CloudinaryService) { }


  public async getUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      })

      if (!user) throw new NotFoundException("User not found", { description: 'user/user-not-found' })

      return user
    } catch (err) {
      this.generateErrorResponse(err, { message: 'Cannot get user', cause: 'Internal error', description: 'user/internal-error' })
    }
  }

  public async updateUserInfo(dto: UpdateUserDto, userId: string) {
    try {
      let hash: string;
      if (dto?.password) {
        hash = await this.hashData(dto.password)
        delete dto.password
      }
      return await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          hash,
          ...dto,
        }
      }).catch(err => {
        if (err instanceof PrismaClientKnownRequestError) {
          //P2025 - An operation failed because it depends on one or more records that were required but not found
          if (err.code === 'P2025') throw new NotFoundException('User not found', { description: 'user/user-not-found' })

          //P2023 - Inconsistent column data
          if (err.code === 'P2023') throw new BadRequestException("Invalid data", { description: 'user/validation-error', cause: err.message })
        }
        if (err instanceof PrismaClientUnknownRequestError) {
          throw new InternalServerErrorException("Failed to update user", { cause: err.message, description: 'user/internal-error' })
        }

        if (err instanceof PrismaClientValidationError) {
          throw new BadRequestException('Failed to validate data', { cause: err.message, description: 'user/validation-error' })
        }

        throw new InternalServerErrorException('Failed to update user', { description: 'user/update-failed' })
      })
    } catch (err) {
      this.generateErrorResponse(err, { message: 'Cannot update user', cause: 'Internal error', description: 'user/internal-error' })
    }
  }


  //TODO: Написати функціонал для оновлення аватару користувачів, та завантаження їх в storage
  public async updateUserAvatar(userId: string) {
    console.log(userId)
  }


  public async deleteUser(userId: string) {
    try {
      const {avatar} = await this.prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          avatar: true
        }
      })

      if (avatar && avatar.key) {
        await this.cloudinary.destroy(avatar.key)
      }

      return await this.prisma.user.delete({
        where: {
          id: userId,
          role: {
            not: 'Admin'
          }
        }
      }).catch(err => {
        if (err instanceof PrismaClientKnownRequestError) {
          //P2025 - An operation failed because it depends on one or more records that were required but not found
          if (err.code === 'P2025') throw new NotFoundException('User not found', { description: 'user/user-not-found' })

          //P2023 - Inconsistent column data
          if (err.code === 'P2023') throw new BadRequestException("Invalid user id", { description: 'user/validation-error', cause: err.message })
        }
        throw new InternalServerErrorException('Failed to delete user', { description: 'user/update-failed' })
      })
    } catch (err) {
      this.generateErrorResponse(err, { message: "Cannot delete user", description: 'user/internal-error', cause: "Internal error" })
    }
  }

  public async sendEmailVerificationCode(userId: string) {
    try {
      const user = await this.getUser(userId)

      const verificationCode = this.generateVerificationCode(6)

      const hashedCode = await this.hashData(`${verificationCode}`)


      //Видаляємо всі попередні коди
      await this.prisma.verificationCode.deleteMany({
        where: {
          userId
        }
      })

      const dbVerificationCodeObject = await this.prisma.verificationCode.create({
        data: {
          code: hashedCode,
          userId,
          expiration: new Date(Date.now() + (1000 * 60 * 2))
        }
      })

      await this.mailer.sendEmailVerificationCode(user, verificationCode)

      const job: Job = scheduleJob(dbVerificationCodeObject.expiration, async () => {
        try {
          await this.prisma.verificationCode.delete({
            where: {
              id: dbVerificationCodeObject.id
            }
          })
        } finally {
          job.cancel()
        }
      })


      return dbVerificationCodeObject
    } catch (err) {
      this.generateErrorResponse(err, { message: "Internal Error", description: 'user/internal-error', cause: "Internal error" })
    }
  }

  public async sendPasswordResetLink(userId: string, link: string) {
    try {
      const user = await this.getUser(userId)

      const hashedLink = await this.hashData(link)

      await this.prisma.passwordResetLink.deleteMany({
        where: {
          userId
        }
      })

      const passwordResetDbObject = await this.prisma.passwordResetLink.create({
        data: {
          link: hashedLink,
          userId,
          expiration: new Date(Date.now() + (1000 * 60 * 5))
        }
      })

      await this.mailer.sendPasswordResetLink(user, link)

      const job: Job = scheduleJob(passwordResetDbObject.expiration, async () => {
        try {
          await this.prisma.passwordResetLink.delete({
            where: {
              id: passwordResetDbObject.id
            }
          })
        } finally {
          job.cancel()
        }
      })
    } catch (err) {
      this.generateErrorResponse(err, { message: "Verification Error", description: 'user/internal-error', cause: "Internal error" })
    }
  }

  public async verifyEmail(userId: string, code: number) {
    try {
      const verificationCodes = await this.prisma.verificationCode.findMany({
        where: {
          userId
        }
      })

      for (const verificationCode of verificationCodes) {
        if (Date.now() > new Date(verificationCode.expiration).getTime()) {
          await this.prisma.verificationCode.delete({
            where: {
              id: verificationCode.id
            }
          })
        } else {
          const isCodeValid = await bcrypt.compare(`${code}`, verificationCode.code);

          if (isCodeValid) {
            await this.prisma.user.update({
              where: {
                id: userId
              },
              data: {
                emailVerified: true
              }
            })

            break
          }
        }
      }

      return {
        message: "Email successfully verified"
      }
    } catch (err) {
      this.generateErrorResponse(err, { message: "Verification Error", description: 'user/internal-error', cause: "Internal error" })
    }
  }




  private generateVerificationCode(length: number): number {
    let code: number = 0;
    for (let i = 1; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10)
      code = (code * 10) + randomNumber
    }
    return code
  }



  private generateErrorResponse(
    err: any,
    {
      message,
      description,
      cause,
    }: { message?: string; description?: string; cause?: string } = undefined,
  ) {
    if (err instanceof HttpException) {
      let description;

      if (typeof err.getResponse() === 'string') {
        description = err.getResponse();
      } else {
        const response = err.getResponse() as { error?: string };
        description = response?.error;
      }
      throw new HttpException(err.message, err.getStatus(), {
        description,
        cause: err.cause,
      });
    }
    throw new InternalServerErrorException(message, {
      description,
      cause,
    });
  }

  private async hashData(data: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
  }
}
