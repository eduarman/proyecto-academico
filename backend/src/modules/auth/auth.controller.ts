import { Body, Controller, Get, Patch, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/api/auth/refresh',
    });
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresh no válido');
    }

    const result = await this.authService.refresh(refreshToken);
    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/api/auth/refresh',
    });
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    response.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return { message: 'Sesión cerrada' };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@Req() request: Request) {
    return request.user;
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Patch('password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(@Req() request: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(request.user.id, dto);
  }
}
