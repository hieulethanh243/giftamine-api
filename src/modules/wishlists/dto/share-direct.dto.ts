import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ShareDirectDto {
  @ApiProperty({
    example: 'uuid-user',
  })
  @IsUUID()
  targetUserId: string;
}
