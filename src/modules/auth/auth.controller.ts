import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from 'src/common/decorators';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản mới với email và mật khẩu',
  })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập',
    description: 'Đăng nhập với email và mật khẩu để nhận access token',
  })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      data: result,
      message: 'Đăng nhập thành công',
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const payload = JSON.parse(
      Buffer.from(dto.refreshToken.split('.')[1], 'base64').toString(),
    ) as { sub: string };
    const result = await this.authService.refresh(
      payload.sub,
      dto.refreshToken,
    );
    return { data: result, message: 'Refresh token thành công' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(@CurrentUser('sub') userId: string) {
    await this.authService.logout(userId);
    return { data: null, message: 'Đăng xuất thành công' };
  }
}
