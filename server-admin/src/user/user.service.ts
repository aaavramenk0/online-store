import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';


import { generateErrorResponse } from 'src/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { TypeGetUsersQuery } from './types';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }


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
          username: dto.username
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
}
