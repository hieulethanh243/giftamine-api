import { ApiPropertyOptional } from '@nestjs/swagger';
import { Plan, Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class QueryUsersDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Plan })
  @IsOptional()
  @IsEnum(Plan)
  plan?: Plan;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
