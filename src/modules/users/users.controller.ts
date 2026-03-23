import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('sub') userId: string) {
    const data = await this.userService.getMe(userId);
    return { data, message: 'User profile retrieved successfully' };
  }

  @Patch('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const data = await this.userService.updateMe(userId, dto);
    return { data, message: 'User profile updated successfully' };
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(@Query() dto: QueryUsersDto) {
    const data = await this.userService.getUsers(dto);
    return { data, message: 'Users retrieved successfully' };
  }

  @Get('search')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiQuery({ name: 'q', required: true, example: 'john' })
  async searchUsers(
    @Query('q') query: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.userService.searchUsers(userId, query);
    return { data, message: 'Users retrieved successfully' };
  }
}
