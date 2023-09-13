
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';


import { bcrypt, generateErrorResponse } from 'src/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MailService } from 'src/mail/mail.service';


import { TypeGetUsersQuery } from './types';
import { PasswordResetDto, UpdateUserDto } from './dto';
import { Job, scheduleJob } from 'node-schedule';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService, private mailer: MailService) { }


  public async getUsers(query: TypeGetUsersQuery) {
    try {
      const { page, perPage, sortBy, sortOrder, search, role } = query

      if (!parseInt(perPage) || !parseInt(page)) throw new BadRequestException

      const take = parseInt(perPage) ?? 25
      const skip = ((parseInt(perPage) ?? 1) - 1) * take

      const users = await this.prisma.user.findMany({
        where: {
          role,
          ...(search && {
            OR: [
              {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                username: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          })
        },
        orderBy: {
          [sortBy]: sortOrder ?? 'asc'
        },
        take,
        skip
      })

      return users
    } catch (err) {
      throw generateErrorResponse(err)
    }
  }


  public async getUser(userId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      }).catch(err => {
        if (err instanceof PrismaClientKnownRequestError) {
          //P2025 - An operation failed because it depends on one or more records that were required but not found
          if (err.code === 'P2025') throw new NotFoundException('User not found', { description: 'user/user-not-found' })

          //P2023 - Inconsistent column data
          if (err.code === 'P2023') throw new BadRequestException("Invalid data", { description: 'user/validation-error', cause: err.message })
        }

        throw new InternalServerErrorException("Internal error")
      })
    } catch (err) {
      throw generateErrorResponse(err, { message: 'Failed to get user', cause: 'Internal error', description: 'user/internal-error' })
    }
  }

  public async updateUser(userId: string, dto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          role: dto.role,
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
      throw generateErrorResponse(err, { message: 'Failed to update user', cause: 'Internal error', description: 'user/internal-error' })
    }
  }


  public async deleteUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
          role: {
            not: "Admin"
          }
        },
        select: {
          avatar: true
        }
      })

      if (user.avatar && user.avatar.key) {
        await this.cloudinary.destroy(user.avatar.key)
      }
      return await this.prisma.user.delete({
        where: {
          id: userId
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
      throw generateErrorResponse(err, { message: 'Failed to delete user', cause: 'Internal error', description: 'user/internal-error' })
    }
  }


  public async sendEmailVerificationCode(userId: string) {
    try {
      const user = await this.getUser(userId)

      const verificationCode = this.generateVerificationCode(6)

      const hashedCode = await bcrypt.hash(`${verificationCode}`)


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
      throw generateErrorResponse(err, { message: "Internal Error", description: 'user/internal-error', cause: "Internal error" })
    }
  }

  public async sendPasswordResetLink(userId: string, link: string) {
    try {
      const user = await this.getUser(userId)

      const hashedLink = await bcrypt.hash(link)

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
      throw generateErrorResponse(err, { message: "Verification Error", description: 'user/internal-error', cause: "Internal error" })
    }
  }


  public async resetPassword(userId: string, dto: PasswordResetDto) {
    try {
       await this.getUser(userId);

      const hash = await bcrypt.hash(dto.password)

      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          hash
        }
      })

      return updatedUser
    } catch (err) {
      throw generateErrorResponse(err, { message: "Failed to change password", cause: "Internal error", description: "user/internal-error" })
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
      throw generateErrorResponse(err, { message: "Verification Error", description: 'user/internal-error', cause: "Internal error" })
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
}
