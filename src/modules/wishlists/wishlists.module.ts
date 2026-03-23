import { Module } from '@nestjs/common';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { WishlistsHelper } from 'src/helpers/wishlist.helper';

@Module({
  controllers: [WishlistsController],
  providers: [WishlistsService, WishlistsHelper],
  exports: [WishlistsService, WishlistsHelper],
})
export class WishlistsModule {}
