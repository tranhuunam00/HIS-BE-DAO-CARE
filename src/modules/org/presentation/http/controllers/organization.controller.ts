import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { GetOrganizationUseCase } from '../../../application/use-cases/get-organization.use-case';
import { UpdateOrganizationUseCase } from '../../../application/use-cases/update-organization.use-case';
import { UpdateOrganizationDto, OrganizationResponseDto } from '../../../application/dtos/organization.dto';

@ApiTags('Organization Management')
@Controller('org')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase
  ) {}

  @Get()
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lấy cấu hình Tổ chức mặc định' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto, description: 'Trả về thông tin cấu hình' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thông tin tổ chức' })
  async getOrg(): Promise<OrganizationResponseDto> {
    return await this.getOrganizationUseCase.execute();
  }

  @Put()
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Cập nhật cấu hình Tổ chức' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto, description: 'Cấu hình tổ chức được cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật cấu hình tổ chức' })
  async updateOrg(@Body() dto: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    return await this.updateOrganizationUseCase.execute(dto);
  }
}
