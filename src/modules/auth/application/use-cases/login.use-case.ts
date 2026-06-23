import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { LoginDto } from '../dtos/login.dto';
import { TokenResponseDto } from '../dtos/token-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Tạo payload JWT
    const payload = { sub: user.id, email: user.email, roleId: user.roleId };

    // Sinh Access Token (15 phút)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Sinh Refresh Token (7 ngày)
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Hash Refresh Token và cập nhật vào Database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const updatedUser = user.updateRefreshToken(refreshTokenHash);
    await this.userRepository.save(updatedUser);

    return {
      accessToken,
      refreshToken,
    };
  }
}
