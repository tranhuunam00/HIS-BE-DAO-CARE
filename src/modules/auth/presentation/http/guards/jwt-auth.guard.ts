import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import type { Request } from 'express';
import { UserOrmEntity } from '../../../infrastructure/database/user.entity';
import { StaffOrmEntity } from '../../../../org/infrastructure/database/staff.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Yêu cầu Access Token hợp lệ');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.dataSource.getRepository(UserOrmEntity).findOne({
        where: { id: payload.sub },
        relations: { role: true },
      });
      if (!user || !user.isActive || user.lockedAt) {
        throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không còn hiệu lực');
      }

      const staff = await this.dataSource.getRepository(StaffOrmEntity).findOneBy({ userId: user.id });

      (request as any).user = {
        ...payload,
        defaultBranchId: user.defaultBranchId,
        branchScopeMode: user.branchScopeMode,
        roleName: user.role?.name ?? null,
        staffName: staff?.fullName ?? null,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Access Token không hợp lệ hoặc đã hết hạn');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
