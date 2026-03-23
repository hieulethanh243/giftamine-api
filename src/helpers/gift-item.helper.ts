import { Injectable } from '@nestjs/common';
import {
  ForbiddenResourceException,
  ResourceNotFoundException,
} from 'src/common/exceptions/app.exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GiftItemHelper {
  constructor(private prisma: PrismaService) {}

  async findAndCheckOwner(userId: string, id: string) {
    const giftItem = await this.prisma.db.giftItem.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!giftItem) throw new ResourceNotFoundException('Gift item');
    if (giftItem.userId !== userId) throw new ForbiddenResourceException();
    return giftItem;
  }

  async checkWishlistAccess(userId: string, wishlistId: string) {
    const wishlist = await this.prisma.db.wishlist.findUnique({
      where: { id: wishlistId },
      select: {
        userId: true,
        isShared: true,
        shares: { select: { sharedToId: true, acceptedAt: true } },
      },
    });
    if (!wishlist) throw new ResourceNotFoundException('Wishlist');

    const isOwner = wishlist.userId === userId;
    const isSharedTo = wishlist.shares.some(
      (s) => s.sharedToId === userId && s.acceptedAt !== null,
    );

    if (!isOwner && !isSharedTo) throw new ForbiddenResourceException();
  }
}
