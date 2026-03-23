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
import { WishlistsService } from './wishlists.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import {
  CreateWishlistDto,
  QueryWishlistDto,
  UpdateWishlistDto,
} from './dto/wishlist.dto';
import { Plan } from 'src/common/enums/plan.enum';
import { ShareDirectDto } from './dto/share-direct.dto';

@ApiTags('wishlists')
@ApiBearerAuth('access-token')
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new wishlist',
    description: 'Create a new wishlist for the current user',
  })
  async create(
    @CurrentUser('sub') userId: string,
    @CurrentUser('plan') plan: string,
    @Body() dto: CreateWishlistDto,
  ) {
    const data = await this.wishlistsService.createWishlist(
      userId,
      plan as Plan,
      dto,
    );

    return { data, message: 'Wishlist created successfully' };
  }

  @Get('my-wishlists')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my wishlists',
    description: 'Get all wishlists created by the current user',
  })
  async getMyWishlists(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryWishlistDto,
  ) {
    const data = await this.wishlistsService.getMyWishlists(userId, query);
    return { data };
  }

  @Get('shared-with-me')
  @ApiOperation({ summary: 'Danh sách wishlist được share cho mình' })
  async getSharedWithMe(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryWishlistDto,
  ) {
    const data = await this.wishlistsService.getSharedWithMe(userId, query);
    return { data, message: 'Lấy danh sách wishlist thành công' };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a wishlist by id',
    description: 'Get a wishlist by id',
  })
  async getWishlistById(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    const data = await this.wishlistsService.getWishlistById(userId, id);
    return { data };
  }

  @Post(':id/share/directly')
  @ApiOperation({
    summary: 'Share wishlist directly to a user',
  })
  async shareDirectly(
    @CurrentUser('sub') userId: string,
    @Param('id') wishlistId: string,
    @Body() dto: ShareDirectDto,
  ) {
    const data = await this.wishlistsService.shareDirectly(
      userId,
      wishlistId,
      dto.targetUserId,
    );
    return { data, message: 'Share wishlist successfully' };
  }

  @Post(':id/share/link')
  @ApiOperation({ summary: 'Tạo link chia sẻ wishlist' })
  async createShareLink(
    @CurrentUser('sub') userId: string,
    @Param('id') wishlistId: string,
  ) {
    const data = await this.wishlistsService.createShareLink(
      userId,
      wishlistId,
    );
    return { data, message: 'Tạo link chia sẻ thành công' };
  }

  // Preview trước khi accept
  @Get('shared/:token/preview')
  @ApiOperation({ summary: 'Preview wishlist trước khi nhận share' })
  async previewShareLink(
    @CurrentUser('sub') userId: string,
    @Param('token') shareToken: string,
  ) {
    const data = await this.wishlistsService.previewShareLink(
      shareToken,
      userId,
    );
    return { data, message: 'Lấy thông tin wishlist thành công' };
  }

  // Accept share qua link
  @Post('shared/:token/accept')
  @ApiOperation({ summary: 'Nhận share wishlist qua link' })
  async acceptShareLink(
    @CurrentUser('sub') userId: string,
    @Param('token') shareToken: string,
  ) {
    const data = await this.wishlistsService.acceptShareLink(
      shareToken,
      userId,
    );
    return { data, message: 'Nhận share wishlist thành công' };
  }

  @Get('shared-with-me/:wishlistId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xem chi tiết wishlist được share' })
  async getSharedWishlist(
    @CurrentUser('sub') userId: string,
    @Param('wishlistId') wishlistId: string,
  ) {
    const data = await this.wishlistsService.getSharedWishlist(
      userId,
      wishlistId,
    );
    return { data, message: 'Lấy wishlist thành công' };
  }

  @Delete(':id/share/:targetUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa share với 1 user' })
  async removeShare(
    @CurrentUser('sub') userId: string,
    @Param('id') wishlistId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    await this.wishlistsService.removeShare(userId, wishlistId, targetUserId);
    return { data: null, message: 'Xóa share thành công' };
  }

  @Get(':id/shares')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách user đang được share wishlist' })
  async getShareList(
    @CurrentUser('sub') userId: string,
    @Param('id') wishlistId: string,
  ) {
    const data = await this.wishlistsService.getShareList(userId, wishlistId);
    return { data, message: 'Lấy danh sách share thành công' };
  }

  @Delete(':id/unshare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tắt chia sẻ toàn bộ wishlist' })
  async unshare(
    @CurrentUser('sub') userId: string,
    @Param('id') wishlistId: string,
  ) {
    const data = await this.wishlistsService.unshare(userId, wishlistId);
    return { data, message: 'Tắt chia sẻ wishlist thành công' };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật wishlist' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') wishlistId: string,
    @Body() dto: UpdateWishlistDto,
  ) {
    const data = await this.wishlistsService.update(userId, wishlistId, dto);
    return { data, message: 'Cập nhật wishlist thành công' };
  }
}
