import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { LoginDto } from '../dtos/login.dto';
import { TokenResponseDto } from '../dtos/token-response.dto';
import {
  DEFAULT_FAILED_LOGIN_LIMIT,
  PASSWORD_HASH_ROUNDS,
} from '../../domain/constants/auth.constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource
  ) {}

  async execute(dto: LoginDto, clientIp?: string): Promise<TokenResponseDto> {
    const user = await this.userRepository.findByLoginIdentity(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive || user.lockedAt) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      const limit = user.failedLoginLimit ?? DEFAULT_FAILED_LOGIN_LIMIT;
      await this.userRepository.save(user.recordFailedLogin(limit));
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const activeBranchId = user.defaultBranchId ?? user.branchScopeIds[0] ?? null;
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      activeBranchId,
      branchScopeMode: user.branchScopeMode,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, PASSWORD_HASH_ROUNDS);
    const updatedUser = user.resetFailedLoginCount().updateRefreshToken(refreshTokenHash);
    await this.userRepository.save(updatedUser);

    return {
      accessToken,
      refreshToken,
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
