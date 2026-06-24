import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { LoginDto } from '../dtos/login.dto';
import { TokenResponseDto } from '../dtos/token-response.dto';
import { BranchAllowedIpOrmEntity } from '../../infrastructure/database/branch-allowed-ip.entity';
import { LoginTimeWindowOrmEntity } from '../../infrastructure/database/login-time-window.entity';
import { DEFAULT_FAILED_LOGIN_LIMIT, DEFAULT_LOGIN_TIMEZONE } from '../../domain/constants/auth.constants';
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

    await this.ensureAllowedLoginTime(user.loginTimeWindowId);
    await this.ensureAllowedIp(user.defaultBranchId, user.bypassIpRestriction, clientIp);

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

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
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

  private async ensureAllowedLoginTime(loginTimeWindowId: string | null): Promise<void> {
    if (!loginTimeWindowId) {
      return;
    }

    const window = await this.dataSource.getRepository(LoginTimeWindowOrmEntity).findOneBy({
      id: loginTimeWindowId,
      isActive: true,
    });

    if (!window) {
      throw new UnauthorizedException('Khung thời gian đăng nhập không còn hiệu lực');
    }

    const current = this.getCurrentTimeValue();
    const start = this.toTimeValue(window.startTime);
    const end = this.toTimeValue(window.endTime);
    const isAllowed = start <= end
      ? current >= start && current <= end
      : current >= start || current <= end;

    if (!isAllowed) {
      throw new UnauthorizedException('Tài khoản không được phép đăng nhập ngoài khung giờ đã cấu hình');
    }
  }

  private async ensureAllowedIp(
    defaultBranchId: string | null,
    bypassIpRestriction: boolean,
    clientIp?: string
  ): Promise<void> {
    if (bypassIpRestriction || !defaultBranchId) {
      return;
    }

    const configuredIps = await this.dataSource.getRepository(BranchAllowedIpOrmEntity).find({
      where: { branchId: defaultBranchId, isActive: true },
    });

    const hasWildcard = configuredIps.some((item) => item.ipAddress.trim() === '*');
    if (hasWildcard) {
      return;
    }

    if (configuredIps.length === 0 || !clientIp) {
      throw new UnauthorizedException('IP đăng nhập không thuộc chi nhánh được cấu hình');
    }

    const normalizedIp = this.normalizeIp(clientIp);
    const isAllowed = configuredIps.some((item) => this.ipMatches(normalizedIp, item.ipAddress));
    if (!isAllowed) {
      throw new UnauthorizedException('IP đăng nhập không thuộc chi nhánh được cấu hình');
    }
  }

  private getCurrentTimeValue(): number {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: DEFAULT_LOGIN_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
    const second = Number(parts.find((part) => part.type === 'second')?.value ?? 0);
    return hour * 3600 + minute * 60 + second;
  }

  private toTimeValue(value: string): number {
    const [hour = '0', minute = '0', second = '0'] = value.split(':');
    return Number(hour) * 3600 + Number(minute) * 60 + Number(second);
  }

  private normalizeIp(ip: string): string {
    return ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
  }

  private ipMatches(clientIp: string, configuredIp: string): boolean {
    if (configuredIp.trim() === '*') {
      return true;
    }
    const normalized = this.normalizeIp(configuredIp);
    if (!normalized.includes('/')) {
      return clientIp === normalized;
    }

    const [network, bitsRaw] = normalized.split('/');
    const bits = Number(bitsRaw);
    const clientValue = this.ipv4ToNumber(clientIp);
    const networkValue = this.ipv4ToNumber(network);
    if (clientValue === null || networkValue === null || Number.isNaN(bits)) {
      return false;
    }

    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (clientValue & mask) === (networkValue & mask);
  }

  private ipv4ToNumber(ip: string): number | null {
    const parts = ip.split('.').map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
      return null;
    }
    return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  }
}
