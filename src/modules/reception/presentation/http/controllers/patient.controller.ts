import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListPatientsUseCase, GetPatientUseCase, CreatePatientUseCase, UpdatePatientUseCase } from '../../../application/use-cases/patient.use-cases';
import { ResetPatientPasswordUseCase } from '../../../application/use-cases/reset-patient-password.use-case';
import { CreatePatientDto, UpdatePatientDto, PatientResponseDto } from '../../../application/dtos/patient.dto';
import { ResetPasswordDto } from '../../../../auth/application/dtos/user-admin.dto';

@ApiTags('Patient Profile Management (Lễ tân)')
@Controller('patients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PatientController {
  constructor(
    private readonly listPatientsUseCase: ListPatientsUseCase,
    private readonly getPatientUseCase: GetPatientUseCase,
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly updatePatientUseCase: UpdatePatientUseCase,
    private readonly resetPatientPasswordUseCase: ResetPatientPasswordUseCase,
  ) {}

  @Get()
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Tìm kiếm và lấy danh sách hồ sơ bệnh nhân' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm (tên, số điện thoại, mã bệnh nhân)' })
  @ApiResponse({ status: 200, type: [PatientResponseDto] })
  async getAll(@Query('search') search?: string): Promise<PatientResponseDto[]> {
    return await this.listPatientsUseCase.execute(search);
  }

  @Get(':id')
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Xem hồ sơ chi tiết của bệnh nhân' })
  @ApiResponse({ status: 200, type: PatientResponseDto })
  async getById(@Param('id') id: string): Promise<PatientResponseDto> {
    return await this.getPatientUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Tạo mới hồ sơ bệnh nhân' })
  @ApiResponse({ status: 201, type: PatientResponseDto })
  async create(@Body() dto: CreatePatientDto): Promise<PatientResponseDto> {
    return await this.createPatientUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Cập nhật hồ sơ bệnh nhân' })
  @ApiResponse({ status: 200, type: PatientResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePatientDto): Promise<PatientResponseDto> {
    return await this.updatePatientUseCase.execute(id, dto);
  }

  @Post(':id/reset-password')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Reset mật khẩu hoặc cấp tài khoản mới cho bệnh nhân' })
  @ApiResponse({ status: 200, description: 'Reset mật khẩu thành công' })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.resetPatientPasswordUseCase.execute(id, dto.password);
    return { message: 'Reset mật khẩu thành công' };
  }
}
