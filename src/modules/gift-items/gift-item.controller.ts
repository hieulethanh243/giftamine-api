import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateGiftItemDto,
  PurchaseGiftItemDto,
  QueryGiftItemDto,
} from './dto/gift-item.dto';
import { CurrentUser } from '../../common/decorators';
import { UpdateGiftItemDto } from './dto/update.dto';
import { GiftItemService } from './gift-item.service';
import { Plan } from 'src/common/enums/plan.enum';

@ApiTags('gift-items')
@ApiBearerAuth('access-token')
@Controller('gift-items')
export class GiftItemsController {
  constructor(private readonly giftItemsService: GiftItemService) {}

  @Post('wishlist/:wishlistId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm món quà vào wishlist (Free: tối đa 5)' })
  async create(
    @CurrentUser('sub') userId: string,
    @CurrentUser('plan') plan: Plan,
    @Param('wishlistId') wishlistId: string,
    @Body() dto: CreateGiftItemDto,
  ) {
    const data = await this.giftItemsService.create(
      userId,
      plan,
      wishlistId,
      dto,
    );
    return { data, message: 'Thêm món quà thành công' };
  }

  @Get('wishlist/:wishlistId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách món quà trong wishlist' })
  async getByWishlist(
    @CurrentUser('sub') userId: string,
    @Param('wishlistId') wishlistId: string,
    @Query() query: QueryGiftItemDto,
  ) {
    const data = await this.giftItemsService.getByWishlist(
      userId,
      wishlistId,
      query,
    );
    return { data, message: 'Lấy danh sách món quà thành công' };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chi tiết món quà' })
  async getOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const data = await this.giftItemsService.getOne(userId, id);
    return { data, message: 'Lấy món quà thành công' };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật món quà (chỉ owner)' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGiftItemDto,
  ) {
    const data = await this.giftItemsService.update(userId, id, dto);
    return { data, message: 'Cập nhật món quà thành công' };
  }

  @Patch(':id/claim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim món quà — tôi sẽ mua cái này' })
  async claim(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const data = await this.giftItemsService.claim(userId, id);
    return { data, message: 'Claim món quà thành công' };
  }

  @Patch(':id/unclaim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unclaim món quà — đổi ý không mua nữa' })
  async unclaim(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const data = await this.giftItemsService.unclaim(userId, id);
    return { data, message: 'Unclaim món quà thành công' };
  }

  @Patch(':id/purchase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh dấu đã mua món quà' })
  async purchase(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: PurchaseGiftItemDto,
  ) {
    const data = await this.giftItemsService.purchase(userId, id, dto);
    return { data, message: 'Đánh dấu mua thành công' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa món quà (chỉ owner)' })
  async delete(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    await this.giftItemsService.delete(userId, id);
    return { data: null, message: 'Xóa món quà thành công' };
  }

  @Get('wishlist/:wishlistId/random')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy ngẫu nhiên 1 món quà chưa được mua' })
  async getRandom(
    @CurrentUser('sub') userId: string,
    @Param('wishlistId') wishlistId: string,
  ) {
    const data = await this.giftItemsService.getRandomGiftItem(
      userId,
      wishlistId,
    );
    return { data, message: 'Lấy món quà ngẫu nhiên thành công' };
  }
}
