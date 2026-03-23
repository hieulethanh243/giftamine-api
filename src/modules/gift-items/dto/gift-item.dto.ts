import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GiftItemStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateGiftItemDto {
  @ApiProperty({
    example: 'iPhone 14 Pro Max',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: '500000',
  })
  @IsOptional()
  @IsNumber()
  @Min(8)
  price: number;

  @ApiPropertyOptional({ example: 'https://shopee.vn/...' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ example: 'https://r2.giftamine.com/...' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Size M, màu đen' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  priority?: number;
}

export class PurchaseGiftItemDto {
  @ApiPropertyOptional({ example: 4500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualPrice?: number;
}

export class QueryGiftItemDto extends PaginationDto {
  @ApiPropertyOptional({ enum: GiftItemStatus })
  @IsOptional()
  @IsEnum(GiftItemStatus)
  status?: GiftItemStatus;

  @ApiPropertyOptional({ example: 'túi' })
  @IsOptional()
  @IsString()
  search?: string;
}
