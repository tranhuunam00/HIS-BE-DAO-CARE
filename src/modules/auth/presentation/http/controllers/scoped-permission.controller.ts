import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import {
  ListUserScopedPermissionsUseCase,
  ListRoleScopedPermissionsUseCase,
  SaveRoleScopedPermissionsUseCase,
  SaveUserCustomPermissionsUseCase,
  DeleteScopedPermissionUseCase
} from '../../../application/use-cases/manage-scoped-permissions.use-case';
import {
  SaveRoleScopedPermissionDto,
  SaveUserCustomPermissionDto,
  ScopedPermissionResponseDto,
  UserScopedPermissionsListDto
} from '../../../application/dtos/scoped-permission.dto';

@ApiTags('Scoped Permissions Matrix (Phân quyền ma trận theo cơ sở & máy chụp)')
@Controller('scoped-permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ScopedPermissionController {
  constructor(
    private readonly listUserScopedPermissionsUseCase: ListUserScopedPermissionsUseCase,
    private readonly listRoleScopedPermissionsUseCase: ListRoleScopedPermissionsUseCase,
    private readonly saveRoleScopedPermissionsUseCase: SaveRoleScopedPermissionsUseCase,
    private readonly saveUserCustomPermissionsUseCase: SaveUserCustomPermissionsUseCase,
    private readonly deleteScopedPermissionUseCase: DeleteScopedPermissionUseCase,
  ) {}

  @Get('users')
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy ma trận quyền (gộp nhóm + custom) của tất cả user nhân viên' })
  @ApiResponse({ status: 200, type: [UserScopedPermissionsListDto] })
  async getUsersPermissions(): Promise<UserScopedPermissionsListDto[]> {
    return await this.listUserScopedPermissionsUseCase.execute();
  }

  @Get('roles/:roleId')
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy danh sách các dòng quyền của một Nhóm quyền (Role)' })
  @ApiResponse({ status: 200, type: [ScopedPermissionResponseDto] })
  async getRolePermissions(@Param('roleId') roleId: string): Promise<any[]> {
    return await this.listRoleScopedPermissionsUseCase.execute(roleId);
  }

  @Post('roles/:roleId')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Cấu hình phân quyền cho một Nhóm quyền (Role)' })
  @ApiResponse({ status: 200, type: ScopedPermissionResponseDto })
  async saveRolePermission(
    @Param('roleId') roleId: string,
    @Body() dto: SaveRoleScopedPermissionDto,
  ): Promise<any> {
    return await this.saveRoleScopedPermissionsUseCase.execute(roleId, dto);
  }

  @Post('users/:userId/custom')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Cấu hình phân quyền custom riêng biệt cho một User' })
  @ApiResponse({ status: 200, type: ScopedPermissionResponseDto })
  async saveUserCustomPermission(
    @Param('userId') userId: string,
    @Body() dto: SaveUserCustomPermissionDto,
  ): Promise<any> {
    return await this.saveUserCustomPermissionsUseCase.execute(userId, dto);
  }

  @Delete(':id')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Xóa dòng cấu hình phân quyền (custom hoặc nhóm)' })
  @ApiResponse({ status: 200 })
  async deletePermission(@Param('id') id: string): Promise<void> {
    await this.deleteScopedPermissionUseCase.execute(id);
  }
}
