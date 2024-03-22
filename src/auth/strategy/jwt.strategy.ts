import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    id: string;
    email: string;
    username: string;
    iat: number;
    exp: number;
  }) {
    const { id } = payload;
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        username: true,
        email: true,
        password: false,
      },
    });

    return { ...user };
  }
}
