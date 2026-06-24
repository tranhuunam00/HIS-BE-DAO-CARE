import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListDepartmentsUseCase } from '../../../application/use-cases/list-departments.use-case';
import { CreateDepartmentUseCase } from '../../../application/use-cases/create-department.use-case';
import { UpdateDepartmentUseCase } from '../../../application/use-cases/update-department.use-case';
import { ToggleDepartmentStatusUseCase } from '../../../application/use-cases/toggle-department-status.use-case';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponseDto } from '../../../application/dtos/department.dto';

@ApiTags('Department Management')
@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DepartmentController {
  constructor(
    private readonly listDepartmentsUseCase: ListDepartmentsUseCase,
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
    private readonly toggleDepartmentStatusUseCase: ToggleDepartmentStatusUseCase
  ) {}

  @Get()
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lấy danh sách bộ phận/phòng ban' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Lọc theo ID chi nhánh' })
  @ApiResponse({ status: 200, type: [DepartmentResponseDto], description: 'Trả về danh sách bộ phận' })
  async getAll(@Query('branchId') branchId?: string): Promise<DepartmentResponseDto[]> {
    return await this.listDepartmentsUseCase.execute(branchId);
  }

  @Post()
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Tạo bộ phận/phòng ban mới' })
  @ApiResponse({ status: 201, type: DepartmentResponseDto, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Mã bộ phận đã tồn tại' })
  async create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return await this.createDepartmentUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Cập nhật bộ phận/phòng ban' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bộ phận' })
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    return await this.updateDepartmentUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Bật/tắt hoạt động bộ phận/phòng ban' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bộ phận' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ): Promise<DepartmentResponseDto> {
    return await this.toggleDepartmentStatusUseCase.execute(id, isActive);
  }
}
