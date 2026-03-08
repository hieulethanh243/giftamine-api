import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import {
  EmailAlreadyExistsException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
} from '../../common/exceptions/app.exception';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.db.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new EmailAlreadyExistsException();

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.db.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.plan);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.db.user.findUnique({
      where: { email: dto.email },
    });
    if (!user?.password) throw new InvalidCredentialsException();

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new InvalidCredentialsException();

    const tokens = await this.generateTokens(user.id, user.email, user.plan);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(userId: string, rawToken: string) {
    const user = await this.prisma.db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, plan: true, refreshToken: true },
    });

    if (!user?.refreshToken) throw new InvalidRefreshTokenException();

    const match = await bcrypt.compare(rawToken, user.refreshToken);
    if (!match) throw new InvalidRefreshTokenException();

    const tokens = await this.generateTokens(user.id, user.email, user.plan);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.db.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private async generateTokens(userId: string, email: string, plan: string) {
    const payload = { sub: userId, email, plan };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
  private async saveRefreshToken(userId: string, raw: string) {
    const hashed = await bcrypt.hash(raw, 10);
    await this.prisma.db.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }

  private sanitize(user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
    plan: string;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
    };
  }
}
