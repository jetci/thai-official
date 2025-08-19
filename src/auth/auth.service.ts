import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import ms from 'ms';

// Define a type for the tokens for clarity
export interface Tokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerUserDto: RegisterUserDto, userAgent?: string, ip?: string): Promise<Tokens> {
    const { email, password } = registerUserDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashData(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    return this.generateAndSaveTokens(user, userAgent, ip);
  }

  async login(loginUserDto: LoginUserDto, userAgent?: string, ip?: string): Promise<Tokens> {
    const { email, password } = loginUserDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAndSaveTokens(user, userAgent, ip);
  }

  async logout(jti: string): Promise<void> {
    const refreshToken = await this.prisma.refreshToken.findUnique({ where: { jti } });
    if (refreshToken) {
        await this.prisma.refreshToken.update({
            where: { id: refreshToken.id },
            data: { revokedAt: new Date() },
        });
    }
  }

  async refreshToken(oldJti: string, oldToken: string, userAgent?: string, ip?: string): Promise<Tokens> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { jti: oldJti },
        include: { user: true },
    });

    // Reuse detection
    if (!refreshToken || refreshToken.revokedAt) {
        if (refreshToken?.userId) {
            // If we can identify the user, revoke all their tokens as a security measure
            await this.revokeAllUserTokens(refreshToken.userId);
        }
        throw new ForbiddenException('Access Denied: Invalid or revoked token.');
    }

    const rtMatches = await bcrypt.compare(oldToken, refreshToken.tokenHash);
    if (!rtMatches) {
        // This case is unlikely if JTI matches but hash doesn't, but good to have.
        // Revoke all tokens for this user as it's a high-risk situation.
        await this.revokeAllUserTokens(refreshToken.userId);
        throw new ForbiddenException('Access Denied: Token mismatch.');
    }

    // Generate new tokens
    const newTokens = await this.generateAndSaveTokens(refreshToken.user, userAgent, ip, refreshToken.id);

    return newTokens;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profile } = user;
    return profile;
  }

  private async generateAndSaveTokens(user: User, userAgent?: string, ip?: string, oldTokenId?: string): Promise<Tokens> {
    const jti = crypto.randomUUID();
    const tokens = await this.getTokens(user.id, user.email, user.role, jti);
    const hashedRefreshToken = await this.hashData(tokens.refresh_token);

    const refreshTokenTtl = this.configService.get<string>('JWT_REFRESH_TTL', '7d');
    const ttlMs = ms(refreshTokenTtl as any);

    if (!ttlMs) {
      this.logger.error(`Invalid JWT_REFRESH_TTL value: ${refreshTokenTtl}`);
      throw new Error('Invalid JWT_REFRESH_TTL configuration.');
    }
    const expiresAt = new Date(Date.now() + ttlMs);

    // Create new refresh token in DB
    const newRefreshToken = await this.prisma.refreshToken.create({
        data: {
            userId: user.id,
            jti,
            tokenHash: hashedRefreshToken,
            expiresAt,
            userAgent,
            ip,
        },
    });

    // If this is a rotation, mark the old token as revoked and link to the new one
    if (oldTokenId) {
        await this.prisma.refreshToken.update({
            where: { id: oldTokenId },
            data: { 
                revokedAt: new Date(),
                replacedByTokenId: newRefreshToken.id,
            },
        });
    }

    return tokens;
  }

  private async getTokens(userId: string, email: string, role: Role, jti: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_TTL'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, jti }, // Refresh token only needs sub and jti
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_TTL'),
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
  }

  private hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
}
