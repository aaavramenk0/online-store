import { createParamDecorator, ExecutionContext, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GetCurrentUserId = createParamDecorator(
  async (data: undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const userId = request?.user?.sub;

    if (!userId) throw new NotFoundException('User not found');

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UnauthorizedException('Unauthorized');

    return userId;
  },
)