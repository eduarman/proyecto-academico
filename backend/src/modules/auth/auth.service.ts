import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly passwordHashMap = new Map<string, string>([
    ['admin@academia.com', bcrypt.hashSync('Admin123', 10)],
    ['estudiante@academia.com', bcrypt.hashSync('Estudiante123', 10)],
  ]);

  private readonly refreshTokens = new Map<string, { userId: string; expiresAt: number }>();
  private readonly resetTokens = new Map<string, { userId: string; expiresAt: number; used: boolean }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersService.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'ESTUDIANTE',
    });
    this.passwordHashMap.set(dto.email, passwordHash);
    return user;
  }

  async login(dto: LoginDto) {
    const user = this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const hash = this.passwordHashMap.get(user.email);
    if (!hash || !(await bcrypt.compare(dto.password, hash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 'ACTIVO') {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = randomUUID();
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken: string) {
    const tokenEntry = this.refreshTokens.get(refreshToken);
    if (!tokenEntry || tokenEntry.expiresAt < Date.now()) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = this.usersService.tryFindOne(tokenEntry.userId);
    if (!user || user.status !== 'ACTIVO') {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    const newRefreshToken = randomUUID();
    this.refreshTokens.delete(refreshToken);
    this.refreshTokens.set(newRefreshToken, {
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    return { accessToken, refreshToken: newRefreshToken, user };
  }

  async logout(refreshToken: string) {
    this.refreshTokens.delete(refreshToken);
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'Si el email existe, revisa tu bandeja de entrada.' };
    }

    const token = randomUUID();
    this.resetTokens.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 30 * 60 * 1000,
      used: false,
    });

    return {
      message: 'Si el email existe, revisa tu bandeja de entrada.',
      token,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = this.resetTokens.get(dto.token);
    if (!token || token.used || token.expiresAt < Date.now()) {
      throw new BadRequestException('Token de restablecimiento inválido o vencido');
    }

    const user = this.usersService.tryFindOne(token.userId);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    this.passwordHashMap.set(user.email, passwordHash);
    token.used = true;
    this.resetTokens.delete(dto.token);

    return { message: 'Contraseña actualizada con éxito' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = this.usersService.findOne(userId);
    const hash = this.passwordHashMap.get(user.email);
    if (!hash || !(await bcrypt.compare(dto.currentPassword, hash))) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    this.passwordHashMap.set(user.email, newHash);
    return { message: 'Contraseña actualizada con éxito' };
  }

  validateUserFromToken(payload: { sub: string; email: string; role: string }) {
    const user = this.usersService.tryFindOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    return user;
  }
}
