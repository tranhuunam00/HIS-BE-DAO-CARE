import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListIcd10UseCase } from '../../../application/use-cases/list-icd10.use-case';
import { GetIcd10UseCase } from '../../../application/use-cases/get-icd10.use-case';
import { CreateIcd10UseCase } from '../../../application/use-cases/create-icd10.use-case';
import { UpdateIcd10UseCase } from '../../../application/use-cases/update-icd10.use-case';
import {
  CreateIcd10Dto,
  UpdateIcd10Dto,
  Icd10ResponseDto,
  PaginatedIcd10ResponseDto,
} from '../../../application/dtos/icd10.dto';

@ApiTags('Medical - ICD-10')
@Controller('icd10')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class Icd10Controller {
  constructor(
    private readonly listIcd10UseCase: ListIcd10UseCase,
    private readonly getIcd10UseCase: GetIcd10UseCase,
    private readonly createIcd10UseCase: CreateIcd10UseCase,
    private readonly updateIcd10UseCase: UpdateIcd10UseCase,
  ) {}

  @Get()
  @RequirePermissions('icd10:read')
  @ApiOperation({ summary: 'Tìm kiếm và phân trang danh mục ICD-10' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo mã hoặc tên bệnh' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại (mặc định 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định 20)' })
  @ApiResponse({ status: 200, description: 'Danh sách ICD-10 có phân trang' })
  async getAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedIcd10ResponseDto> {
    return await this.listIcd10UseCase.execute(
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  @RequirePermissions('icd10:read')
  @ApiOperation({ summary: 'Xem chi tiết mã ICD-10' })
  @ApiResponse({ status: 200, description: 'Chi tiết mã ICD-10' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mã ICD-10' })
  async getById(@Param('id') id: string): Promise<Icd10ResponseDto> {
    return await this.getIcd10UseCase.execute(id);
  }

  @Post()
  @RequirePermissions('icd10:write')
  @ApiOperation({ summary: 'Thêm mã ICD-10 mới' })
  @ApiResponse({ status: 201, description: 'Thêm thành công' })
  @ApiResponse({ status: 409, description: 'Mã ICD-10 đã tồn tại' })
  async create(@Body() dto: CreateIcd10Dto): Promise<Icd10ResponseDto> {
    return await this.createIcd10UseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('icd10:write')
  @ApiOperation({ summary: 'Cập nhật mã ICD-10' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mã ICD-10' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIcd10Dto,
  ): Promise<Icd10ResponseDto> {
    return await this.updateIcd10UseCase.execute(id, dto);
  }
}
