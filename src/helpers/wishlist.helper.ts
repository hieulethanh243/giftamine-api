import { Injectable } from '@nestjs/common';
import { ForbiddenResourceException } from 'src/common/exceptions/app.exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishlistsHelper {
  constructor(private prisma: PrismaService) {}

  async getPartnerId(userId: string): Promise<string | null> {
    const couple = await this.prisma.db.coupleConnection.findFirst({
      where: {
        OR: [
          { senderId: userId, status: 'CONNECTED' },
          { receiverId: userId, status: 'CONNECTED' },
        ],
      },
      select: { senderId: true, receiverId: true },
    });

    if (!couple) return null;
    return couple.senderId === userId ? couple.receiverId : couple.senderId;
  }

  async findAndCheckOwner(userId: string, wishlistId: string) {
    const wishlist = await this.prisma.db.wishlist.findUnique({
      where: { id: wishlistId },
      select: { id: true, userId: true },
    });

    if (!wishlist) return null;
    if (wishlist.userId !== userId) throw new ForbiddenResourceException();

    return wishlist;
  }

  async checkAccess(
    userId: string,
    wishlist: { userId: string; isShared: boolean; sharedWith: string | null },
  ) {
    if (wishlist.userId === userId) return;

    const partnerId = await this.getPartnerId(userId);

    if (
      wishlist.isShared &&
      (wishlist.sharedWith === null || wishlist.sharedWith === userId)
    )
      return;

    if (wishlist.isShared && partnerId && wishlist.userId === partnerId) return;

    throw new ForbiddenResourceException();
  }
}
