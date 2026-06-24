import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleResponseDto } from '../../../application/dtos/user-admin.dto';
import { ListRolesUseCase } from '../../../application/use-cases/list-roles.use-case';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@ApiTags('Role Management')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly listRolesUseCase: ListRolesUseCase) {}

  @Get()
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy danh sách nhóm user/vai trò' })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  async getAll(): Promise<RoleResponseDto[]> {
    return await this.listRolesUseCase.execute();
  }
}
