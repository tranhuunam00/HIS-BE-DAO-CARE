import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import {
  GetStaffSchedulesUseCase,
  UpdateStaffScheduleTemplateUseCase,
  CreateStaffScheduleOverrideUseCase,
  RemoveStaffScheduleOverrideUseCase,
} from '../../../application/use-cases/staff-schedule.use-cases';
import {
  UpdateStaffScheduleTemplateDto,
  CreateOverrideDto,
  StaffScheduleOverrideResponseDto,
  ResolvedScheduleResponseDto,
} from '../../../application/dtos/schedule.dto';

@ApiTags('Engine - Staff Schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StaffScheduleController {
  constructor(
    private readonly getStaffSchedulesUseCase: GetStaffSchedulesUseCase,
    private readonly updateStaffScheduleTemplateUseCase: UpdateStaffScheduleTemplateUseCase,
    private readonly createStaffScheduleOverrideUseCase: CreateStaffScheduleOverrideUseCase,
    private readonly removeStaffScheduleOverrideUseCase: RemoveStaffScheduleOverrideUseCase,
  ) {}

  @Get()
  @RequirePermissions('schedule:read')
  @ApiOperation({ summary: 'Lấy lịch làm việc thực tế đã phân giải của nhân viên' })
  @ApiQuery({ name: 'staffIds', type: [String], required: true })
  @ApiQuery({ name: 'startDate', type: String, required: true })
  @ApiQuery({ name: 'endDate', type: String, required: true })
  @ApiResponse({ status: 200, type: [ResolvedScheduleResponseDto] })
  async getSchedules(
    @Query('staffIds') staffIds: string | string[],
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ResolvedScheduleResponseDto[]> {
    const ids = Array.isArray(staffIds) ? staffIds : [staffIds].filter(Boolean);
    return await this.getStaffSchedulesUseCase.execute(ids, startDate, endDate);
  }

  @Post('template')
  @RequirePermissions('schedule:update')
  @ApiOperation({ summary: 'Cập nhật mẫu lịch làm việc tuần (Template)' })
  @ApiResponse({ status: 200, description: 'Cập nhật lịch tuần thành công' })
  async updateTemplate(@Body() dto: UpdateStaffScheduleTemplateDto): Promise<{ message: string }> {
    await this.updateStaffScheduleTemplateUseCase.execute(dto);
    return { message: 'Cập nhật lịch tuần thành công' };
  }

  @Post('override')
  @RequirePermissions('schedule:update-daily')
  @ApiOperation({ summary: 'Điều chỉnh lịch làm việc 1 ngày (Override / Nghỉ phép)' })
  @ApiResponse({ status: 201, type: StaffScheduleOverrideResponseDto })
  async createOverride(@Body() dto: CreateOverrideDto): Promise<StaffScheduleOverrideResponseDto> {
    return await this.createStaffScheduleOverrideUseCase.execute(dto);
  }

  @Delete('override/:id')
  @RequirePermissions('schedule:update-daily')
  @ApiOperation({ summary: 'Hủy điều chỉnh lịch ngày' })
  @ApiResponse({ status: 200, description: 'Hủy điều chỉnh thành công' })
  async deleteOverride(@Param('id') id: string): Promise<{ message: string }> {
    await this.removeStaffScheduleOverrideUseCase.execute(id);
    return { message: 'Hủy điều chỉnh thành công' };
  }
}
