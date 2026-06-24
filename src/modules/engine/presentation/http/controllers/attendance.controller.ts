import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { CheckInUseCase, CheckOutUseCase, GetTodayStatusUseCase } from '../../../application/use-cases/attendance.use-cases';
import { CheckInDto, CheckOutDto, AttendanceResponseDto } from '../../../application/dtos/attendance.dto';

@ApiTags('Engine - Staff Attendance')
@Controller('schedules/attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(
    private readonly checkInUseCase: CheckInUseCase,
    private readonly checkOutUseCase: CheckOutUseCase,
    private readonly getTodayStatusUseCase: GetTodayStatusUseCase,
  ) {}

  @Post('check-in')
  @RequirePermissions('schedule:update-daily')
  @ApiOperation({ summary: 'Điểm danh vào ca trực (Check-in)' })
  @ApiResponse({ status: 201, type: AttendanceResponseDto })
  async checkIn(@Body() dto: CheckInDto): Promise<AttendanceResponseDto> {
    const attendance = await this.checkInUseCase.execute(dto);
    return this.mapToDto(attendance);
  }

  @Post('check-out')
  @RequirePermissions('schedule:update-daily')
  @ApiOperation({ summary: 'Điểm danh ra ca trực (Check-out)' })
  @ApiResponse({ status: 200, type: AttendanceResponseDto })
  async checkOut(@Body() dto: CheckOutDto): Promise<AttendanceResponseDto> {
    const attendance = await this.checkOutUseCase.execute(dto);
    return this.mapToDto(attendance);
  }

  @Get('today-status/:staffId')
  @RequirePermissions('schedule:read')
  @ApiOperation({ summary: 'Lấy trạng thái điểm danh hôm nay của nhân viên' })
  @ApiQuery({ name: 'date', type: String, required: true, description: 'Định dạng YYYY-MM-DD' })
  @ApiResponse({ status: 200, type: [AttendanceResponseDto] })
  async getTodayStatus(
    @Param('staffId') staffId: string,
    @Query('date') date: string,
  ): Promise<AttendanceResponseDto[]> {
    const list = await this.getTodayStatusUseCase.execute(staffId, date);
    return list.map((a) => this.mapToDto(a));
  }

  private mapToDto(domain: any): AttendanceResponseDto {
    return {
      id: domain.id,
      staffId: domain.staffId,
      branchId: domain.branchId,
      date: domain.date,
      shiftId: domain.shiftId,
      checkInTime: domain.checkInTime,
      checkOutTime: domain.checkOutTime,
      checkoutReason: domain.checkoutReason,
      status: domain.status,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
