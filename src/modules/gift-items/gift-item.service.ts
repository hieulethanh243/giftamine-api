import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateGiftItemDto,
  PurchaseGiftItemDto,
  QueryGiftItemDto,
} from './dto/gift-item.dto';
import { ResourceNotFoundException } from 'src/common/exceptions/app.exception';
import { Plan } from 'src/common/enums/plan.enum';
import { paginate } from 'src/common/dto/pagination.dto';
import { GiftItemHelper } from 'src/helpers/gift-item.helper';
import { UpdateGiftItemDto } from './dto/update.dto';

@Injectable()
export class GiftItemService {
  constructor(
    private prisma: PrismaService,
    private helper: GiftItemHelper,
  ) {}

  async create(
    userId: string,
    plan: Plan,
    wishlistId: string,
    dto: CreateGiftItemDto,
  ) {
    const wishlist = await this.prisma.db.wishlist.findUnique({
      where: { id: wishlistId },
      select: { id: true, userId: true },
    });

    if (!wishlist) {
      throw new ResourceNotFoundException('Wishlist');
    }

    if (wishlist.userId !== userId)
      throw new ResourceNotFoundException('Wishlist');

    if (plan === Plan.FREE) {
      const count = await this.prisma.db.giftItem.count({
        where: { userId, status: 'ACTIVE' },
      });

      if (count >= 5) {
        throw new Error(
          'Free plan users can only create up to 5 active gift items',
        );
      }
    }

    return this.prisma.db.giftItem.create({
      data: { ...dto, wishlistId, userId },
      select: giftItemSelect,
    });
  }

  async getByWishlist(
    userId: string,
    wishlistId: string,
    dto: QueryGiftItemDto,
  ) {
    const { page = 1, limit = 20, status, search } = dto;
    const skip = (page - 1) * limit;

    await this.helper.checkWishlistAccess(userId, wishlistId);

    const where = {
      wishlistId,
      ...(status && { status }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [giftItems, total] = await Promise.all([
      this.prisma.db.giftItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        select: giftItemSelect,
      }),
      this.prisma.db.giftItem.count({ where }),
    ]);

    return { giftItems, meta: paginate(total, page, limit) };
  }

  async getOne(userId: string, id: string) {
    const giftItem = await this.prisma.db.giftItem.findUnique({
      where: { id },
      select: { ...giftItemSelect, wishlistId: true, userId: true },
    });

    if (!giftItem) {
      throw new ResourceNotFoundException('Gift item');
    }

    await this.helper.checkWishlistAccess(userId, giftItem.wishlistId);

    return giftItem;
  }

  async update(userId: string, id: string, dto: UpdateGiftItemDto) {
    await this.helper.findAndCheckOwner(userId, id);

    return this.prisma.db.giftItem.update({
      where: { id },
      data: dto,
      select: giftItemSelect,
    });
  }

  async claim(viewerId: string, id: string) {
    const giftItem = await this.prisma.db.giftItem.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        wishlistId: true,
        status: true,
        claimedBy: true,
      },
    });
    if (!giftItem) throw new ResourceNotFoundException('Gift item');

    await this.helper.checkWishlistAccess(viewerId, giftItem.wishlistId);

    if (giftItem.status !== 'ACTIVE') {
      throw new BadRequestException({
        code: 'GIFT_ITEM_NOT_AVAILABLE',
        message: 'Món quà này đã được claim hoặc mua rồi',
      });
    }

    return this.prisma.db.giftItem.update({
      where: { id },
      data: { status: 'CLAIMED', claimedBy: viewerId, claimedAt: new Date() },
      select: giftItemSelect,
    });
  }

  async unclaim(viewerId: string, id: string) {
    const giftItem = await this.prisma.db.giftItem.findUnique({
      where: { id },
      select: { id: true, status: true, claimedBy: true },
    });
    if (!giftItem) throw new ResourceNotFoundException('Gift item');

    if (giftItem.claimedBy !== viewerId) {
      throw new BadRequestException({
        code: 'NOT_CLAIMED_BY_YOU',
        message: 'Bạn không phải người đã claim món quà này',
      });
    }

    if (giftItem.status !== 'CLAIMED') {
      throw new BadRequestException({
        code: 'GIFT_ITEM_NOT_CLAIMED',
        message: 'Món quà này chưa được claim',
      });
    }

    return this.prisma.db.giftItem.update({
      where: { id },
      data: { status: 'ACTIVE', claimedBy: null, claimedAt: null },
      select: giftItemSelect,
    });
  }

  async purchase(viewerId: string, id: string, dto: PurchaseGiftItemDto) {
    const giftItem = await this.prisma.db.giftItem.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        wishlistId: true,
        status: true,
        claimedBy: true,
      },
    });
    if (!giftItem) throw new ResourceNotFoundException('Gift item');

    if (giftItem.userId === viewerId) {
      throw new BadRequestException({
        code: 'CANNOT_PURCHASE_OWN',
        message:
          'Bạn không thể đánh dấu mua món quà trong wishlist của chính mình',
      });
    }

    // Phải là người claim hoặc được share
    if (giftItem.claimedBy && giftItem.claimedBy !== viewerId) {
      throw new BadRequestException({
        code: 'CLAIMED_BY_ANOTHER',
        message: 'Món quà này đã được người khác claim',
      });
    }

    await this.helper.checkWishlistAccess(viewerId, giftItem.wishlistId);

    return this.prisma.db.giftItem.update({
      where: { id },
      data: {
        status: 'PURCHASED',
        purchasedBy: viewerId,
        purchasedAt: new Date(),
        actualPrice: dto.actualPrice,
      },
      select: giftItemSelect,
    });
  }

  async delete(userId: string, id: string) {
    await this.helper.findAndCheckOwner(userId, id);
    await this.prisma.db.giftItem.delete({ where: { id } });
  }

  async getRandomGiftItem(userId: string, wishlistId: string) {
    await this.helper.checkWishlistAccess(userId, wishlistId);

    const items = await this.prisma.db.giftItem.findMany({
      where: { wishlistId, status: 'ACTIVE' },
      select: { id: true },
    });

    if (items.length === 0) {
      throw new ResourceNotFoundException('Gift item');
    }

    const randomItem = items[Math.floor(Math.random() * items.length)];

    return randomItem;
  }
}

const giftItemSelect = {
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
  actualPrice: true,
  wishlistId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
};
