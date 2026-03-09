import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; plan: string }) {
    const user = await this.prisma.db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, plan: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException();

    return {
      sub: user.id,
      email: user.email,
      plan: user.plan,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      role: user.role,
    };
  }
}
