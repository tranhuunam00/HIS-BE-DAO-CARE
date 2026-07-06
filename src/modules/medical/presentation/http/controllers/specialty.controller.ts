import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListSpecialtiesUseCase } from '../../../application/use-cases/list-specialties.use-case';
import { GetSpecialtyUseCase } from '../../../application/use-cases/get-specialty.use-case';
import { CreateSpecialtyUseCase } from '../../../application/use-cases/create-specialty.use-case';
import { UpdateSpecialtyUseCase } from '../../../application/use-cases/update-specialty.use-case';
import { ToggleSpecialtyStatusUseCase } from '../../../application/use-cases/toggle-specialty-status.use-case';
import {
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyResponseDto,
} from '../../../application/dtos/specialty.dto';

@ApiTags('Medical - Specialties')
@Controller('specialties')
export class SpecialtyController {
  constructor(
    private readonly listSpecialtiesUseCase: ListSpecialtiesUseCase,
    private readonly getSpecialtyUseCase: GetSpecialtyUseCase,
    private readonly createSpecialtyUseCase: CreateSpecialtyUseCase,
    private readonly updateSpecialtyUseCase: UpdateSpecialtyUseCase,
    private readonly toggleSpecialtyStatusUseCase: ToggleSpecialtyStatusUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách chuyên khoa (Public)' })
  @ApiResponse({ status: 200, description: 'Danh sách chuyên khoa' })
  async getAll(): Promise<SpecialtyResponseDto[]> {
    return await this.listSpecialtiesUseCase.execute();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('specialty:read')
  @ApiOperation({ summary: 'Xem chi tiết chuyên khoa' })
  @ApiResponse({ status: 200, description: 'Chi tiết chuyên khoa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chuyên khoa' })
  async getById(@Param('id') id: string): Promise<SpecialtyResponseDto> {
    return await this.getSpecialtyUseCase.execute(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('specialty:write')
  @ApiOperation({ summary: 'Tạo mới chuyên khoa' })
  @ApiResponse({ status: 201, description: 'Tạo chuyên khoa thành công' })
  @ApiResponse({ status: 409, description: 'Mã chuyên khoa đã tồn tại' })
  async create(@Body() dto: CreateSpecialtyDto): Promise<SpecialtyResponseDto> {
    return await this.createSpecialtyUseCase.execute(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('specialty:write')
  @ApiOperation({ summary: 'Cập nhật chuyên khoa' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chuyên khoa' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    return await this.updateSpecialtyUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('specialty:write')
  @ApiOperation({ summary: 'Bật/tắt trạng thái hoạt động chuyên khoa' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chuyên khoa' })
  async toggleStatus(@Param('id') id: string): Promise<SpecialtyResponseDto> {
    return await this.toggleSpecialtyStatusUseCase.execute(id);
  }
}
