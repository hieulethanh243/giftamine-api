import { BadRequestException, Injectable } from '@nestjs/common';
import { Plan } from 'src/common/enums/plan.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateWishlistDto,
  QueryWishlistDto,
  UpdateWishlistDto,
} from './dto/wishlist.dto';
import {
  ForbiddenResourceException,
  FreePlanLimitException,
  ResourceNotFoundException,
} from 'src/common/exceptions/app.exception';
import { WishlistsHelper } from 'src/helpers/wishlist.helper';
import { paginate } from 'src/common/dto/pagination.dto';
import { randomBytes } from 'node:crypto';

@Injectable()
export class WishlistsService {
  constructor(
    private prisma: PrismaService,
    private helper: WishlistsHelper,
  ) {}

  async createWishlist(userId: string, plan: Plan, dto: CreateWishlistDto) {
    if (plan === Plan.FREE) {
      const count = await this.prisma.db.wishlist.count({ where: { userId } });

      if (count >= 1) {
        throw new FreePlanLimitException(
          'Tài khoản Free chỉ được tạo 1 wishlist. Nâng cấp Premium để tạo không giới hạn.',
        );
      }
    }

    const wishlist = await this.prisma.db.wishlist.create({
      data: { ...dto, userId },
      select: wishlistSelect,
    });

    return wishlist;
  }

  async getMyWishlists(userId: string, dto: QueryWishlistDto) {
    const { page = 1, limit = 20, search, occasion } = dto;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      isActive: true,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(occasion && { occasion }),
    };

    const [wishlists, total] = await Promise.all([
      this.prisma.db.wishlist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...wishlistSelect,
          _count: { select: { giftItems: true } },
          shares: {
            select: {
              sharedTo: { select: { id: true, name: true, avatarUrl: true } },
              acceptedAt: true,
            },
          },
        },
      }),
      this.prisma.db.wishlist.count({ where }),
    ]);

    return { wishlists, meta: paginate(total, page, limit) };
  }

  async getWishlistById(userId: string, id: string) {
    const wishlist = await this.prisma.db.wishlist.findUnique({
      where: { id },
      select: {
        ...wishlistSelect,
        shares: {
          select: { sharedToId: true, acceptedAt: true },
        },
        giftItems: {
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            name: true,
            price: true,
            url: true,
            imageUrl: true,
            notes: true,
            priority: true,
            status: true,
            claimedBy: true,
            claimedAt: true,
            purchasedBy: true,
            purchasedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!wishlist) throw new ResourceNotFoundException('Wishlist');

    const isOwner = wishlist.userId === userId;
    const isSharedTo = wishlist.shares.some(
      (s) => s.sharedToId === userId && s.acceptedAt !== null,
    );

    if (!isOwner && !isSharedTo) throw new ForbiddenResourceException();

    return wishlist;
  }

  async shareDirectly(
    ownerId: string,
    wishlistId: string,
    targetUserId: string,
  ) {
    const wishlist = await this.helper.findAndCheckOwner(ownerId, wishlistId);

    if (!wishlist) {
      throw new ResourceNotFoundException('Wishlist');
    }

    if (targetUserId === ownerId) {
      throw new BadRequestException({
        code: 'CANNOT_SHARE_TO_SELF',
        message: 'Không thể chia sẻ wishlist cho chính mình',
      });
    }

    const targetUser = await this.prisma.db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true },
    });

    if (!targetUser) {
      throw new ResourceNotFoundException('Target user');
    }

    const share = await this.prisma.db.wishlistShare.upsert({
      where: {
        wishlistId_sharedToId: {
          wishlistId,
          sharedToId: targetUserId,
        },
      },
      create: {
        wishlistId,
        sharedToId: targetUserId,
        sharedById: ownerId,
        acceptedAt: new Date(),
      },
      update: {
        acceptedAt: new Date(),
      },
      select: {
        id: true,
        sharedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.prisma.db.wishlist.update({
      where: { id: wishlistId },
      data: { isShared: true },
    });

    return share;
  }

  async createShareLink(ownerId: string, wishlistId: string) {
    const wishlist = await this.helper.findAndCheckOwner(ownerId, wishlistId);

    if (!wishlist) {
      throw new ResourceNotFoundException('Wishlist');
    }

    const shareToken = randomBytes(16).toString('hex');

    return this.prisma.db.wishlist.update({
      where: { id: wishlistId },
      data: {
        isShared: true,
        shareToken,
      },
      select: {
        id: true,
        shareToken: true,
        isShared: true,
      },
    });
  }

  async acceptShareLink(shareToken: string, viewerId: string) {
    const wishlist = await this.prisma.db.wishlist.findUnique({
      where: { shareToken },
      select: {
        id: true,
        userId: true,
        isShared: true,
        name: true,
      },
    });

    if (!wishlist || !wishlist.isShared) {
      throw new ResourceNotFoundException('Shared wishlist');
    }

    if (wishlist.userId === viewerId) {
      throw new BadRequestException({
        code: 'CANNOT_ACCEPT_OWN_WISHLIST',
        message: 'Không thể chấp nhận chia sẻ cho chính wishlist của mình',
      });
    }

    const share = await this.prisma.db.wishlistShare.upsert({
      where: {
        wishlistId_sharedToId: {
          wishlistId: wishlist.id,
          sharedToId: viewerId,
        },
      },
      create: {
        wishlistId: wishlist.id,
        sharedToId: viewerId,
        sharedById: wishlist.userId,
        acceptedAt: new Date(),
      },
      update: {
        acceptedAt: new Date(),
      },
      select: {
        id: true,
        wishlist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return share;
  }

  async previewShareLink(shareToken: string, viewerId: string) {
    const wishlist = await this.prisma.db.wishlist.findUnique({
      where: { shareToken },
      select: {
        id: true,
        name: true,
        description: true,
        isShared: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        _count: { select: { giftItems: true } },
      },
    });

    if (!wishlist || !wishlist.isShared)
      throw new ResourceNotFoundException('Wishlist');
    if (wishlist.user.id === viewerId) {
      throw new BadRequestException({
        code: 'CANNOT_ACCEPT_OWN_WISHLIST',
        message: 'Đây là wishlist của bạn',
      });
    }

    return wishlist;
  }

  async getSharedWithMe(userId: string, dto: QueryWishlistDto) {
    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const [shares, total] = await Promise.all([
      this.prisma.db.wishlistShare.findMany({
        where: { sharedToId: userId, acceptedAt: { not: null } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          acceptedAt: true,
          wishlist: {
            select: {
              ...wishlistSelect,
              _count: { select: { giftItems: true } },
            },
          },
          sharedBy: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.db.wishlistShare.count({
        where: { sharedToId: userId, acceptedAt: { not: null } },
      }),
    ]);

    return { shares, meta: paginate(total, page, limit) };
  }

  async getSharedWishlist(userId: string, wishlistId: string) {
    const share = await this.prisma.db.wishlistShare.findUnique({
      where: { wishlistId_sharedToId: { wishlistId, sharedToId: userId } },
      select: { acceptedAt: true },
    });

    if (!share?.acceptedAt) throw new ForbiddenResourceException();

    return this.prisma.db.wishlist.findUnique({
      where: { id: wishlistId },
      select: {
        ...wishlistSelect,
        giftItems: {
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            name: true,
            price: true,
            url: true,
            imageUrl: true,
            priority: true,
            status: true,
            claimedBy: true,
            purchasedBy: true,
            claimedAt: true,
            purchasedAt: true,
          },
        },
      },
    });
  }

  async removeShare(ownerId: string, wishlistId: string, targetUserId: string) {
    const wishlist = await this.helper.findAndCheckOwner(ownerId, wishlistId);
    if (!wishlist) throw new ResourceNotFoundException('Wishlist');

    await this.prisma.db.wishlistShare.deleteMany({
      where: { wishlistId, sharedToId: targetUserId },
    });

    const remaining = await this.prisma.db.wishlistShare.count({
      where: { wishlistId },
    });

    if (remaining === 0) {
      await this.prisma.db.wishlist.update({
        where: { id: wishlistId },
        data: { isShared: false, shareToken: null },
      });
    }
  }

  async getShareList(userId: string, wishlistId: string) {
    await this.helper.findAndCheckOwner(userId, wishlistId);

    return this.prisma.db.wishlistShare.findMany({
      where: { wishlistId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        acceptedAt: true,
        createdAt: true,
        sharedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async unshare(ownerId: string, wishlistId: string) {
    await this.helper.findAndCheckOwner(ownerId, wishlistId);

    await this.prisma.db.wishlistShare.deleteMany({ where: { wishlistId } });

    return this.prisma.db.wishlist.update({
      where: { id: wishlistId },
      data: { isShared: false, shareToken: null },
      select: { id: true, isShared: true },
    });
  }

  async update(userId: string, wishlistId: string, dto: UpdateWishlistDto) {
    await this.helper.findAndCheckOwner(userId, wishlistId);

    return this.prisma.db.wishlist.update({
      where: { id: wishlistId },
      data: dto,
      select: wishlistSelect,
    });
  }
}

const wishlistSelect = {
  id: true,
  name: true,
  description: true,
  occasion: true,
  isActive: true,
  isShared: true,
  shareToken: true,
  sharedWith: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true, avatarUrl: true },
  },
};
