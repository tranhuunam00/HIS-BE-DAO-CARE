import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { PATIENT_VISIT_STATUS } from '../../../../../common/constants/workflow.constants';
import {
  ListPatientVisitsUseCase,
  GetPatientVisitUseCase,
  CheckInUseCase,
  UpdateVitalSignsUseCase,
  TransferRoomUseCase,
  ConfirmResultsWaitUseCase,
  AcceptPatientUseCase,
  CompletePatientUseCase,
} from '../../../application/use-cases/patient-visit.use-cases';
import { CheckInDto, UpdateVitalSignsDto, TransferRoomDto, PatientVisitResponseDto } from '../../../application/dtos/patient-visit.dto';
import { CreateAuditLogUseCase } from '../../../../auth/application/use-cases/create-audit-log.use-case';
import { RoomOrmEntity } from '../../../../org/infrastructure/database/room.entity';
import { StaffOrmEntity } from '../../../../org/infrastructure/database/staff.entity';

@ApiTags('Patient Visit & Queue Management (Đón tiếp & Điều phối)')
@Controller('visits')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PatientVisitController {
  constructor(
    private readonly listPatientVisitsUseCase: ListPatientVisitsUseCase,
    private readonly getPatientVisitUseCase: GetPatientVisitUseCase,
    private readonly checkInUseCase: CheckInUseCase,
    private readonly updateVitalSignsUseCase: UpdateVitalSignsUseCase,
    private readonly transferRoomUseCase: TransferRoomUseCase,
    private readonly confirmResultsWaitUseCase: ConfirmResultsWaitUseCase,
    private readonly acceptPatientUseCase: AcceptPatientUseCase,
    private readonly completePatientUseCase: CompletePatientUseCase,
    private readonly createAuditLogUseCase: CreateAuditLogUseCase,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lấy danh sách hàng đợi điều phối lượt khám' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'roomId', required: false, description: 'Lọc theo phòng khám hiện tại' })
  @ApiQuery({ name: 'status', required: false, enum: PATIENT_VISIT_STATUS, description: 'Lọc trạng thái hàng đợi' })
  @ApiQuery({ name: 'date', required: false, description: 'Lọc ngày tạo lượt khám (YYYY-MM-DD)' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Lọc worklist theo bác sĩ đang/đã nhận ca' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Lọc worklist theo dịch vụ được chỉ định' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Lọc theo ID bệnh nhân' })
  @ApiResponse({ status: 200, type: [PatientVisitResponseDto] })
  async getAll(
    @Query('branchId') branchId?: string,
    @Query('roomId') roomId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('doctorId') doctorId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('patientId') patientId?: string,
  ): Promise<PatientVisitResponseDto[]> {
    return await this.listPatientVisitsUseCase.execute({ branchId, roomId, status, date, doctorId, serviceId, patientId });
  }

  @Get(':id')
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Xem chi tiết lượt khám & sinh hiệu' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async getById(@Param('id') id: string): Promise<PatientVisitResponseDto> {
    return await this.getPatientVisitUseCase.execute(id);
  }

  @Post('check-in')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Tiếp nhận bệnh nhân khám (Check-in), sinh số thứ tự (STT)' })
  @ApiResponse({ status: 201, type: PatientVisitResponseDto })
  async checkIn(@Body() dto: CheckInDto, @Req() req: any): Promise<PatientVisitResponseDto> {
    const result = await this.checkInUseCase.execute(dto);
    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'CHECK_IN',
      module: 'RECEPTION',
      description: `Tiếp nhận bệnh nhân "${result.patient?.fullName || 'N/A'}" (Mã LK: ${result.visitCode}), STT: ${result.queueNumber}`,
      ipAddress: req.ip,
    });
    return result;
  }

  @Put(':id/vitals')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Cập nhật chỉ số sinh hiệu bệnh nhân' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async updateVitals(@Param('id') id: string, @Body() dto: UpdateVitalSignsDto, @Req() req: any): Promise<PatientVisitResponseDto> {
    const result = await this.updateVitalSignsUseCase.execute(id, dto);
    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'UPDATE_VITALS',
      module: 'RECEPTION',
      description: `Cập nhật sinh hiệu bệnh nhân "${result.patient?.fullName || 'N/A'}" (Mã LK: ${result.visitCode}): Mạch ${dto.pulse || '-'}, Huyết áp ${dto.bloodPressure || '-'}, Nhiệt độ ${dto.temperature || '-'}`,
      ipAddress: req.ip,
    });
    return result;
  }

  @Patch(':id/transfer')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Điều phối chuyển phòng khám / gán bác sĩ' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async transferRoom(@Param('id') id: string, @Body() dto: TransferRoomDto, @Req() req: any): Promise<PatientVisitResponseDto> {
    let roomName = dto.roomId || 'N/A';
    let doctorName = dto.doctorId || 'N/A';
    try {
      if (dto.roomId) {
        const room = await this.dataSource.getRepository(RoomOrmEntity).findOneBy({ id: dto.roomId });
        if (room) roomName = room.name;
      }
      if (dto.doctorId) {
        const doc = await this.dataSource.getRepository(StaffOrmEntity).findOneBy({ id: dto.doctorId });
        if (doc) doctorName = doc.fullName;
      }
    } catch {}

    const result = await this.transferRoomUseCase.execute(id, dto);
    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'TRANSFER_ROOM',
      module: 'RECEPTION',
      description: `Điều phối bệnh nhân "${result.patient?.fullName || 'N/A'}" (Mã LK: ${result.visitCode}) đến phòng "${roomName}"${dto.doctorId ? `, BS nhận: "${doctorName}"` : ''}`,
      ipAddress: req.ip,
    });
    return result;
  }

  @Patch(':id/confirm-results-wait')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Xác nhận chờ kết quả khi đã xong hết dịch vụ' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async confirmResultsWait(@Param('id') id: string, @Req() req: any): Promise<PatientVisitResponseDto> {
    const result = await this.confirmResultsWaitUseCase.execute(id);
    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'CONFIRM_RESULTS_WAIT',
      module: 'RECEPTION',
      description: `Xác nhận bệnh nhân "${result.patient?.fullName || 'N/A'}" (Mã LK: ${result.visitCode}) chờ trả kết quả cận lâm sàng`,
      ipAddress: req.ip,
    });
    return result;
  }

  @Patch(':id/accept')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Bác sĩ tiếp nhận bệnh nhân vào phòng khám/CLS' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async acceptPatient(
    @Param('id') id: string,
    @Body() body: { doctorId?: string },
    @Req() req: any,
  ): Promise<PatientVisitResponseDto> {
    const result = await this.acceptPatientUseCase.execute(id, body?.doctorId);
    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'ACCEPT_PATIENT',
      module: 'RECEPTION',
      description: `Bác sĩ nhận bệnh nhân "${result.patient?.fullName || 'N/A'}" (Mã LK: ${result.visitCode}) vào khám thực tế`,
      ipAddress: req.ip,
    });
    return result;
  }

  @Patch(':id/complete')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Bác sĩ kết thúc khám / kết luận lượt khám' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async completePatient(@Param('id') id: string, @Req() req: any): Promise<PatientVisitResponseDto> {
    const result = await this.completePatientUseCase.execute(id);
    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'COMPLETE_PATIENT',
      module: 'RECEPTION',
      description: `Bác sĩ kết luận hoàn thành lượt khám cho bệnh nhân "${result.patient?.fullName || 'N/A'}" (Mã LK: ${result.visitCode})`,
      ipAddress: req.ip,
    });
    return result;
  }
}
