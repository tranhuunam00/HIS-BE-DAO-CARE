import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { TokenResponseDto } from '../dtos/token-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(userId: string, refreshToken: string): Promise<TokenResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    // So khớp Refresh Token với Hash lưu trong DB
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    // Tạo payload mới
    const payload = { sub: user.id, email: user.email, roleId: user.roleId };

    // Sinh Access Token mới (15 phút)
    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Sinh Refresh Token mới (7 ngày - Refresh Token Rotation)
    const newRefreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Hash và lưu Refresh Token mới vào DB
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const updatedUser = user.updateRefreshToken(newRefreshTokenHash);
    await this.userRepository.save(updatedUser);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
