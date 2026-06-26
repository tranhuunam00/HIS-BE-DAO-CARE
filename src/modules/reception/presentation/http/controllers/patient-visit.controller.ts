import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  async checkIn(@Body() dto: CheckInDto): Promise<PatientVisitResponseDto> {
    return await this.checkInUseCase.execute(dto);
  }

  @Put(':id/vitals')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Cập nhật chỉ số sinh hiệu bệnh nhân' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async updateVitals(@Param('id') id: string, @Body() dto: UpdateVitalSignsDto): Promise<PatientVisitResponseDto> {
    return await this.updateVitalSignsUseCase.execute(id, dto);
  }

  @Patch(':id/transfer')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Điều phối chuyển phòng khám / gán bác sĩ' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async transferRoom(@Param('id') id: string, @Body() dto: TransferRoomDto): Promise<PatientVisitResponseDto> {
    return await this.transferRoomUseCase.execute(id, dto);
  }

  @Patch(':id/confirm-results-wait')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Xác nhận chờ kết quả khi đã xong hết dịch vụ' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async confirmResultsWait(@Param('id') id: string): Promise<PatientVisitResponseDto> {
    return await this.confirmResultsWaitUseCase.execute(id);
  }

  @Patch(':id/accept')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Bác sĩ tiếp nhận bệnh nhân vào phòng khám/CLS' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async acceptPatient(
    @Param('id') id: string,
    @Body() body: { doctorId?: string },
  ): Promise<PatientVisitResponseDto> {
    return await this.acceptPatientUseCase.execute(id, body?.doctorId);
  }

  @Patch(':id/complete')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Bác sĩ kết thúc khám / kết luận lượt khám' })
  @ApiResponse({ status: 200, type: PatientVisitResponseDto })
  async completePatient(@Param('id') id: string): Promise<PatientVisitResponseDto> {
    return await this.completePatientUseCase.execute(id);
  }
}
