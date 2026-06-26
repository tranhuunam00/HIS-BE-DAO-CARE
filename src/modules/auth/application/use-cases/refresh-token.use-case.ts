import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { TokenResponseDto } from '../dtos/token-response.dto';
import * as bcrypt from 'bcrypt';
import { PASSWORD_HASH_ROUNDS } from '../../domain/constants/auth.constants';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(userId: string, refreshToken: string): Promise<TokenResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive || user.lockedAt || !user.refreshTokenHash) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    // So khớp Refresh Token với Hash lưu trong DB
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    // Tạo payload mới
    const activeBranchId = user.defaultBranchId ?? user.branchScopeIds[0] ?? null;
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      activeBranchId,
      branchScopeMode: user.branchScopeMode,
    };

    // Sinh Access Token mới (15 phút)
    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Sinh Refresh Token mới (7 ngày - Refresh Token Rotation)
    const newRefreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Hash và lưu Refresh Token mới vào DB
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, PASSWORD_HASH_ROUNDS);
    const updatedUser = user.updateRefreshToken(newRefreshTokenHash);
    await this.userRepository.save(updatedUser);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roleId: user.roleId,
        defaultBranchId: user.defaultBranchId,
        activeBranchId,
        branchScopeMode: user.branchScopeMode,
        branchScopeIds: user.branchScopeIds,
        bypassIpRestriction: user.bypassIpRestriction,
      },
    };
  }
}
