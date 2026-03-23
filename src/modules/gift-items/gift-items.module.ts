import { Module } from '@nestjs/common';
import { GiftItemHelper } from 'src/helpers/gift-item.helper';
import { GiftItemService } from './gift-item.service';
import { GiftItemsController } from './gift-item.controller';

@Module({
  controllers: [GiftItemsController],
  providers: [GiftItemHelper, GiftItemService],
  exports: [GiftItemService],
})
export class GiftItemsModule {}
