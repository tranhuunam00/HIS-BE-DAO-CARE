import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Yêu cầu Refresh Token hợp lệ');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      (request as any).user = payload;
      (request as any).refreshToken = token;
    } catch {
      throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn');
    }
    return true;
  }

  private extractToken(request: Request): string | undefined {
    // 1. Lấy từ header Authorization Bearer
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;

    // 2. Lấy từ cookies (nếu có dùng cookie-parser)
    if (request.cookies && request.cookies['refreshToken']) {
      return request.cookies['refreshToken'];
    }

    // 3. Lấy từ request body
    if (request.body && request.body.refreshToken) {
      return request.body.refreshToken;
    }

    return undefined;
  }
}
