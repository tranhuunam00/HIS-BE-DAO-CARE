import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginTimeWindowResponseDto, UpsertLoginTimeWindowDto } from '../../../application/dtos/user-admin.dto';
import {
  CreateLoginTimeWindowUseCase,
  ListLoginTimeWindowsUseCase,
  ToggleLoginTimeWindowUseCase,
  UpdateLoginTimeWindowUseCase,
} from '../../../application/use-cases/login-time-window.use-cases';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@ApiTags('Login Time Window')
@Controller('login-time-windows')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class LoginTimeWindowController {
  constructor(
    private readonly listLoginTimeWindowsUseCase: ListLoginTimeWindowsUseCase,
    private readonly createLoginTimeWindowUseCase: CreateLoginTimeWindowUseCase,
    private readonly updateLoginTimeWindowUseCase: UpdateLoginTimeWindowUseCase,
    private readonly toggleLoginTimeWindowUseCase: ToggleLoginTimeWindowUseCase
  ) {}

  @Get()
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy danh sách khung thời gian đăng nhập' })
  @ApiResponse({ status: 200, type: [LoginTimeWindowResponseDto] })
  async getAll(): Promise<LoginTimeWindowResponseDto[]> {
    return await this.listLoginTimeWindowsUseCase.execute();
  }

  @Post()
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Tạo khung thời gian đăng nhập' })
  @ApiResponse({ status: 201, type: LoginTimeWindowResponseDto })
  async create(@Body() dto: UpsertLoginTimeWindowDto): Promise<LoginTimeWindowResponseDto> {
    return await this.createLoginTimeWindowUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Cập nhật khung thời gian đăng nhập' })
  @ApiResponse({ status: 200, type: LoginTimeWindowResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpsertLoginTimeWindowDto): Promise<LoginTimeWindowResponseDto> {
    return await this.updateLoginTimeWindowUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Bật/tắt khung thời gian đăng nhập' })
  @ApiResponse({ status: 200, type: LoginTimeWindowResponseDto })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ): Promise<LoginTimeWindowResponseDto> {
    return await this.toggleLoginTimeWindowUseCase.execute(id, isActive);
  }
}
