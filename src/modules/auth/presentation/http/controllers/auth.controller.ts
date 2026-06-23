import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RegisterDto } from '../../../application/dtos/register.dto';
import { TokenResponseDto } from '../../../application/dtos/token-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import type { Request } from 'express';

@ApiTags('Auth & Security')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản nhân viên mới' })
  @ApiResponse({ status: 201, description: 'Tài khoản đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Email đã được sử dụng' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    return {
      message: 'Đăng ký tài khoản thành công',
      userId: user.id,
      email: user.email,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiResponse({ status: 200, type: TokenResponseDto, description: 'Đăng nhập thành công và nhận tokens' })
  @ApiResponse({ status: 401, description: 'Thông tin xác thực sai hoặc tài khoản bị khóa' })
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return await this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
  @ApiResponse({ status: 200, type: TokenResponseDto, description: 'Cấp cặp tokens mới thành công' })
  @ApiResponse({ status: 401, description: 'Refresh Token không hợp lệ hoặc đã hết hạn' })
  async refresh(@Req() req: Request): Promise<TokenResponseDto> {
    const user = (req as any).user;
    const refreshToken = (req as any).refreshToken;
    return await this.refreshTokenUseCase.execute(user?.sub, refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất và thu hồi Refresh Token' })
  @ApiResponse({ status: 204, description: 'Đăng xuất thành công' })
  @ApiResponse({ status: 401, description: 'Access Token không hợp lệ' })
  async logout(@Req() req: Request): Promise<void> {
    const user = (req as any).user;
    await this.logoutUseCase.execute(user?.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin tài khoản đang đăng nhập' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async getMe(@Req() req: Request) {
    return req['user'];
  }
}
