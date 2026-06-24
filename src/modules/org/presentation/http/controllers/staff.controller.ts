import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListStaffUseCase } from '../../../application/use-cases/list-staff.use-case';
import { GetStaffDetailUseCase } from '../../../application/use-cases/get-staff-detail.use-case';
import { CreateStaffUseCase } from '../../../application/use-cases/create-staff.use-case';
import { UpdateStaffUseCase } from '../../../application/use-cases/update-staff.use-case';
import { ToggleStaffStatusUseCase } from '../../../application/use-cases/toggle-staff-status.use-case';
import { UpdateCertificateUseCase } from '../../../application/use-cases/update-certificate.use-case';
import { AssignStaffUseCase } from '../../../application/use-cases/assign-staff.use-case';
import { CreateStaffDto, UpdateStaffDto, UpdatePracticingCertificateDto, AssignStaffDto, StaffResponseDto, PracticingCertificateResponseDto, StaffAssignmentResponseDto } from '../../../application/dtos/staff.dto';

@ApiTags('Staff & HR Management')
@Controller('staff')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(
    private readonly listStaffUseCase: ListStaffUseCase,
    private readonly getStaffDetailUseCase: GetStaffDetailUseCase,
    private readonly createStaffUseCase: CreateStaffUseCase,
    private readonly updateStaffUseCase: UpdateStaffUseCase,
    private readonly toggleStaffStatusUseCase: ToggleStaffStatusUseCase,
    private readonly updateCertificateUseCase: UpdateCertificateUseCase,
    private readonly assignStaffUseCase: AssignStaffUseCase
  ) {}

  @Get()
  @RequirePermissions('staff:read')
  @ApiOperation({ summary: 'Tìm kiếm và lấy danh sách hồ sơ nhân sự' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Lọc nhân viên theo ID chi nhánh' })
  @ApiQuery({ name: 'title', required: false, description: 'Lọc theo chức danh (DOCTOR, NURSE, etc.)' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Lọc trạng thái hoạt động' })
  @ApiQuery({ name: 'roomId', required: false, description: 'Lọc bác sĩ được phân công cho phòng khám cụ thể' })
  @ApiQuery({ name: 'specialtyId', required: false, description: 'Lọc bác sĩ theo chuyên khoa phân công' })
  @ApiResponse({ status: 200, type: [StaffResponseDto], description: 'Trả về danh sách hồ sơ' })
  async getAll(
    @Query('branchId') branchId?: string,
    @Query('title') title?: string,
    @Query('isActive') isActive?: boolean,
    @Query('roomId') roomId?: string,
    @Query('specialtyId') specialtyId?: string,
  ): Promise<StaffResponseDto[]> {
    return await this.listStaffUseCase.execute({ branchId, title, isActive, roomId, specialtyId });
  }

  @Get(':id')
  @RequirePermissions('staff:read')
  @ApiOperation({ summary: 'Xem chi tiết hồ sơ nhân sự kèm chứng chỉ và phân công' })
  @ApiResponse({ status: 200, type: StaffResponseDto, description: 'Trả về chi tiết hồ sơ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
  async getById(@Param('id') id: string): Promise<StaffResponseDto> {
    return await this.getStaffDetailUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('staff:write')
  @ApiOperation({ summary: 'Tạo hồ sơ nhân sự mới' })
  @ApiResponse({ status: 201, type: StaffResponseDto, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Mã nhân viên, Email hoặc CCCD đã được sử dụng' })
  async create(@Body() dto: CreateStaffDto): Promise<StaffResponseDto> {
    return await this.createStaffUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('staff:write')
  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ nhân sự' })
  @ApiResponse({ status: 200, type: StaffResponseDto, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
  async update(@Param('id') id: string, @Body() dto: UpdateStaffDto): Promise<StaffResponseDto> {
    return await this.updateStaffUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('staff:write')
  @ApiOperation({ summary: 'Bật/tắt trạng thái hoạt động của nhân sự' })
  @ApiResponse({ status: 200, type: StaffResponseDto, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ): Promise<StaffResponseDto> {
    return await this.toggleStaffStatusUseCase.execute(id, isActive);
  }

  @Put(':id/certificate')
  @RequirePermissions('staff:write')
  @ApiOperation({ summary: 'Cấu hình/Cập nhật Chứng chỉ hành nghề cho nhân sự' })
  @ApiResponse({ status: 200, type: PracticingCertificateResponseDto, description: 'Lưu thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân sự' })
  async updateCertificate(
    @Param('id') id: string,
    @Body() dto: UpdatePracticingCertificateDto
  ): Promise<PracticingCertificateResponseDto> {
    return await this.updateCertificateUseCase.execute(id, dto);
  }

  @Post(':id/assignments')
  @RequirePermissions('staff:write')
  @ApiOperation({ summary: 'Phân công công tác cho nhân sự vào Chi nhánh & Phòng ban' })
  @ApiResponse({ status: 200, type: StaffAssignmentResponseDto, description: 'Phân công thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân sự, chi nhánh hoặc phòng' })
  async assignStaff(
    @Param('id') id: string,
    @Body() dto: AssignStaffDto
  ): Promise<StaffAssignmentResponseDto> {
    return await this.assignStaffUseCase.execute(id, dto);
  }
}
