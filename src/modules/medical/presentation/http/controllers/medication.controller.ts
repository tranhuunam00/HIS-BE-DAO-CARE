import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListMedicationsUseCase } from '../../../application/use-cases/list-medications.use-case';
import { GetMedicationUseCase } from '../../../application/use-cases/get-medication.use-case';
import { CreateMedicationUseCase } from '../../../application/use-cases/create-medication.use-case';
import { UpdateMedicationUseCase } from '../../../application/use-cases/update-medication.use-case';
import { ToggleMedicationStatusUseCase } from '../../../application/use-cases/toggle-medication-status.use-case';
import {
  CreateMedicationDto,
  UpdateMedicationDto,
  MedicationResponseDto,
} from '../../../application/dtos/medication.dto';

@ApiTags('Medical - Medications')
@Controller('medications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class MedicationController {
  constructor(
    private readonly listMedicationsUseCase: ListMedicationsUseCase,
    private readonly getMedicationUseCase: GetMedicationUseCase,
    private readonly createMedicationUseCase: CreateMedicationUseCase,
    private readonly updateMedicationUseCase: UpdateMedicationUseCase,
    private readonly toggleMedicationStatusUseCase: ToggleMedicationStatusUseCase,
  ) {}

  @Get()
  @RequirePermissions('medication:read')
  @ApiOperation({ summary: 'Tìm kiếm danh mục thuốc' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo tên, mã thuốc hoặc hoạt chất' })
  @ApiResponse({ status: 200, description: 'Danh sách thuốc' })
  async getAll(@Query('search') search?: string): Promise<MedicationResponseDto[]> {
    return await this.listMedicationsUseCase.execute(search);
  }

  @Get(':id')
  @RequirePermissions('medication:read')
  @ApiOperation({ summary: 'Xem chi tiết thuốc' })
  @ApiResponse({ status: 200, description: 'Chi tiết thuốc' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thuốc' })
  async getById(@Param('id') id: string): Promise<MedicationResponseDto> {
    return await this.getMedicationUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('medication:write')
  @ApiOperation({ summary: 'Thêm thuốc mới vào danh mục' })
  @ApiResponse({ status: 201, description: 'Thêm thuốc thành công' })
  @ApiResponse({ status: 409, description: 'Mã thuốc hoặc mã quốc gia đã tồn tại' })
  async create(@Body() dto: CreateMedicationDto): Promise<MedicationResponseDto> {
    return await this.createMedicationUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('medication:write')
  @ApiOperation({ summary: 'Cập nhật thông tin thuốc' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thuốc' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicationDto,
  ): Promise<MedicationResponseDto> {
    return await this.updateMedicationUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('medication:write')
  @ApiOperation({ summary: 'Bật/tắt trạng thái thuốc' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thuốc' })
  async toggleStatus(@Param('id') id: string): Promise<MedicationResponseDto> {
    return await this.toggleMedicationStatusUseCase.execute(id);
  }
}
