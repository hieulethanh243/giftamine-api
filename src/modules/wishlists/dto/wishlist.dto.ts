import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { WishlistOccasion } from 'src/common/enums/wishlist.enum';

export class CreateWishlistDto {
  @ApiProperty({ example: 'Wishlist sinh nhật' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Những món quà tôi muốn nhận' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    enum: WishlistOccasion,
    example: WishlistOccasion.BIRTHDAY,
  })
  @IsOptional()
  @IsEnum(WishlistOccasion)
  occasion?: string;
}

export class UpdateWishlistDto {
  @ApiPropertyOptional({ example: 'Wishlist sinh nhật' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Những món quà tôi muốn nhận' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: WishlistOccasion })
  @IsOptional()
  @IsEnum(WishlistOccasion)
  occasion?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryWishlistDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'sinh nhật' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: WishlistOccasion })
  @IsOptional()
  @IsEnum(WishlistOccasion)
  occasion?: string;
}
