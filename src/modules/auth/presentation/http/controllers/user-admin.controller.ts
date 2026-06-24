import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateManagedUserUseCase } from '../../../application/use-cases/create-managed-user.use-case';
import { GetManagedUserUseCase } from '../../../application/use-cases/get-managed-user.use-case';
import { ListManagedUsersUseCase } from '../../../application/use-cases/list-managed-users.use-case';
import { LockManagedUserUseCase } from '../../../application/use-cases/lock-managed-user.use-case';
import { ResetManagedUserPasswordUseCase } from '../../../application/use-cases/reset-managed-user-password.use-case';
import { UnlockManagedUserUseCase } from '../../../application/use-cases/unlock-managed-user.use-case';
import { UpdateManagedUserUseCase } from '../../../application/use-cases/update-managed-user.use-case';
import {
  CreateManagedUserDto,
  LockUserDto,
  ManagedUserResponseDto,
  ResetPasswordDto,
  UpdateManagedUserDto,
} from '../../../application/dtos/user-admin.dto';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@ApiTags('User Management')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UserAdminController {
  constructor(
    private readonly listManagedUsersUseCase: ListManagedUsersUseCase,
    private readonly getManagedUserUseCase: GetManagedUserUseCase,
    private readonly createManagedUserUseCase: CreateManagedUserUseCase,
    private readonly updateManagedUserUseCase: UpdateManagedUserUseCase,
    private readonly lockManagedUserUseCase: LockManagedUserUseCase,
    private readonly unlockManagedUserUseCase: UnlockManagedUserUseCase,
    private readonly resetManagedUserPasswordUseCase: ResetManagedUserPasswordUseCase
  ) {}

  @Get()
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy danh sách user theo nhóm/phạm vi chi nhánh' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'roleId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'LOCKED'] })
  @ApiResponse({ status: 200, type: [ManagedUserResponseDto] })
  async getAll(
    @Query('search') search?: string,
    @Query('roleId') roleId?: string,
    @Query('status') status?: 'ACTIVE' | 'LOCKED'
  ): Promise<ManagedUserResponseDto[]> {
    return await this.listManagedUsersUseCase.execute({ search, roleId, status });
  }

  @Get(':id')
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Xem chi tiết user' })
  @ApiResponse({ status: 200, type: ManagedUserResponseDto })
  async getById(@Param('id') id: string): Promise<ManagedUserResponseDto> {
    return await this.getManagedUserUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('user:create')
  @ApiOperation({ summary: 'Tạo user cho nhân viên' })
  @ApiResponse({ status: 201, type: ManagedUserResponseDto })
  async create(@Body() dto: CreateManagedUserDto): Promise<ManagedUserResponseDto> {
    return await this.createManagedUserUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Cập nhật thông tin user và phạm vi sử dụng' })
  @ApiResponse({ status: 200, type: ManagedUserResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateManagedUserDto): Promise<ManagedUserResponseDto> {
    return await this.updateManagedUserUseCase.execute(id, dto);
  }

  @Patch(':id/lock')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Khóa user' })
  @ApiResponse({ status: 200, description: 'Khóa user thành công' })
  async lock(@Param('id') id: string, @Body() dto: LockUserDto, @Req() req: Request): Promise<{ message: string }> {
    const actor = (req as any).user?.sub ?? null;
    await this.lockManagedUserUseCase.execute(id, actor, dto.reason ?? null);
    return { message: 'Khóa user thành công' };
  }

  @Patch(':id/unlock')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Mở khóa user' })
  @ApiResponse({ status: 200, description: 'Mở khóa user thành công' })
  async unlock(@Param('id') id: string): Promise<{ message: string }> {
    await this.unlockManagedUserUseCase.execute(id);
    return { message: 'Mở khóa user thành công' };
  }

  @Patch(':id/reset-password')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Reset mật khẩu user' })
  @ApiResponse({ status: 200, description: 'Reset mật khẩu thành công' })
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.resetManagedUserPasswordUseCase.execute(id, dto.password);
    return { message: 'Reset mật khẩu thành công' };
  }
}
