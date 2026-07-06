import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListServicesUseCase } from '../../../application/use-cases/list-services.use-case';
import { GetServiceUseCase } from '../../../application/use-cases/get-service.use-case';
import { CreateServiceUseCase } from '../../../application/use-cases/create-service.use-case';
import { UpdateServiceUseCase } from '../../../application/use-cases/update-service.use-case';
import { ToggleServiceStatusUseCase } from '../../../application/use-cases/toggle-service-status.use-case';
import { UpsertServicePricesUseCase } from '../../../application/use-cases/upsert-service-prices.use-case';
import {
  CreateServiceDto,
  UpdateServiceDto,
  UpsertServicePriceDto,
  ServiceResponseDto,
  ServicePriceResponseDto,
} from '../../../application/dtos/service.dto';

@ApiTags('Medical - Services')
@Controller('services')
export class ServiceController {
  constructor(
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly getServiceUseCase: GetServiceUseCase,
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly toggleServiceStatusUseCase: ToggleServiceStatusUseCase,
    private readonly upsertServicePricesUseCase: UpsertServicePricesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách dịch vụ y tế (Public)' })
  @ApiQuery({ name: 'specialtyId', required: false, description: 'Lọc theo chuyên khoa' })
  @ApiQuery({ name: 'category', required: false, description: 'Lọc theo loại dịch vụ' })
  @ApiResponse({ status: 200, description: 'Danh sách dịch vụ kèm bảng giá' })
  async getAll(
    @Query('specialtyId') specialtyId?: string,
    @Query('category') category?: string,
  ): Promise<ServiceResponseDto[]> {
    return await this.listServicesUseCase.execute(specialtyId, category);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('service:read')
  @ApiOperation({ summary: 'Xem chi tiết dịch vụ' })
  @ApiResponse({ status: 200, description: 'Chi tiết dịch vụ kèm bảng giá' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dịch vụ' })
  async getById(@Param('id') id: string): Promise<ServiceResponseDto> {
    return await this.getServiceUseCase.execute(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('service:write')
  @ApiOperation({ summary: 'Tạo mới dịch vụ y tế' })
  @ApiResponse({ status: 201, description: 'Tạo dịch vụ thành công' })
  @ApiResponse({ status: 409, description: 'Mã dịch vụ đã tồn tại' })
  async create(@Body() dto: CreateServiceDto): Promise<ServiceResponseDto> {
    return await this.createServiceUseCase.execute(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('service:write')
  @ApiOperation({ summary: 'Cập nhật thông tin dịch vụ' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dịch vụ' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return await this.updateServiceUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('service:write')
  @ApiOperation({ summary: 'Bật/tắt trạng thái dịch vụ' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dịch vụ' })
  async toggleStatus(@Param('id') id: string): Promise<ServiceResponseDto> {
    return await this.toggleServiceStatusUseCase.execute(id);
  }

  @Put(':id/prices')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('service:write')
  @ApiOperation({ summary: 'Cập nhật bảng giá dịch vụ (upsert theo loại giá)' })
  @ApiResponse({ status: 200, description: 'Cập nhật bảng giá thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dịch vụ' })
  async upsertPrices(
    @Param('id') id: string,
    @Body() dto: UpsertServicePriceDto,
  ): Promise<ServicePriceResponseDto[]> {
    return await this.upsertServicePricesUseCase.execute(id, dto);
  }
}
