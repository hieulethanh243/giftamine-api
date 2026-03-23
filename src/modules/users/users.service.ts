/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/exceptions/app.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { paginate } from 'src/common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        avatarUrl: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) throw new ResourceNotFoundException('User');

    const coupleAsSender = await this.prisma.db.coupleConnection.findFirst({
      where: { senderId: userId, status: 'CONNECTED' },
      select: {
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const coupleAsReceiver = await this.prisma.db.coupleConnection.findFirst({
      where: { receiverId: userId, status: 'CONNECTED' },
      select: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const partner =
      coupleAsSender?.receiver ?? coupleAsReceiver?.sender ?? null;

    return { ...user, partner };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const exists = await this.prisma.db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!exists) throw new ResourceNotFoundException('User');

    return this.prisma.db.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }

  async getUsers(dto: QueryUsersDto) {
    const { page = 1, limit = 20, search, plan, role, isActive } = dto;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(plan && { plan }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    const [users, total] = await Promise.all([
      this.prisma.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          role: true,
          isActive: true,
          createdAt: true,
          subscription: {
            select: { plan: true, status: true, currentPeriodEnd: true },
          },
        },
      }),
      this.prisma.db.user.count({ where }),
    ]);

    return {
      users,
      meta: paginate(total, page, limit),
    };
  }

  async searchUsers(currentUserId: string, search: string) {
    return this.prisma.db.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
        id: { not: currentUserId },
        isActive: true,
        role: 'USER',
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
  }
}
