import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListAppointmentsUseCase, GetAppointmentUseCase, CreateAppointmentUseCase, UpdateAppointmentUseCase } from '../../../application/use-cases/appointment.use-cases';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponseDto } from '../../../application/dtos/appointment.dto';

@ApiTags('Appointment Management (Lịch hẹn)')
@Controller('appointments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AppointmentController {
  constructor(
    private readonly listAppointmentsUseCase: ListAppointmentsUseCase,
    private readonly getAppointmentUseCase: GetAppointmentUseCase,
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
  ) {}

  @Get()
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn đặt trước' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'Lọc ngày hẹn (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc trạng thái' })
  @ApiQuery({ name: 'phone', required: false, description: 'Lọc theo SĐT bệnh nhân' })
  @ApiResponse({ status: 200, type: [AppointmentResponseDto] })
  async getAll(
    @Query('branchId') branchId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('phone') phone?: string,
  ): Promise<AppointmentResponseDto[]> {
    return await this.listAppointmentsUseCase.execute({ branchId, doctorId, date, status, phone });
  }

  @Get(':id')
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Xem chi tiết lịch hẹn' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async getById(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return await this.getAppointmentUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Tạo lịch hẹn mới' })
  @ApiResponse({ status: 201, type: AppointmentResponseDto })
  async create(@Body() dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    return await this.createAppointmentUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Chỉnh sửa thông tin lịch hẹn (chỉ khi chưa check-in/hủy)' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto): Promise<AppointmentResponseDto> {
    return await this.updateAppointmentUseCase.execute(id, dto);
  }
}
