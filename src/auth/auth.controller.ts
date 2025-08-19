import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RtGuard } from '../common/guards/rt.guard';
import { GetCurrentUser, GetCurrentUserId, Public } from '../common/decorators';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      // expires: new Date(Date.now() + ms(this.configService.get('JWT_REFRESH_TTL'))), // Handled by DB
    });
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully, returns access token and sets refresh token cookie.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<{ access_token: string }> {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    const tokens = await this.authService.register(registerUserDto, userAgent, ip);
    this.setRefreshTokenCookie(res, tokens.refresh_token);
    return { access_token: tokens.access_token };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'Login successful, returns access token and sets refresh token cookie.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<{ access_token: string }> {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    const tokens = await this.authService.login(loginUserDto, userAgent, ip);
    this.setRefreshTokenCookie(res, tokens.refresh_token);
    return { access_token: tokens.access_token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out the user' })
  @ApiCookieAuth() // Indicates that this endpoint uses the refresh_token cookie
  @ApiResponse({ status: 204, description: 'Logout successful, refresh token is revoked.' })
  @ApiResponse({ status: 401, description: 'Unauthorized if no valid refresh token is present.' })
  async logout(
    @GetCurrentUser('jti') jti: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(jti);
    res.clearCookie('refresh_token');
  }

  @Public() // Guard is applied inside
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the access token' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid or revoked refresh token.' })
  async refreshToken(
    @GetCurrentUser('jti') jti: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<{ access_token: string }> {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    const tokens = await this.authService.refreshToken(jti, refreshToken, userAgent, ip);
    this.setRefreshTokenCookie(res, tokens.refresh_token);
    return { access_token: tokens.access_token };
  }

  @Get('profile')
  @ApiBearerAuth('access-token') // Specify the security scheme
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@GetCurrentUserId() userId: string) {
    return this.authService.getProfile(userId);
  }
}
