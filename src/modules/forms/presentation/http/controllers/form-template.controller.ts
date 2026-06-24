import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import {
  ListFormTemplatesUseCase,
  GetFormTemplateUseCase,
  CreateFormTemplateUseCase,
  UpdateFormTemplateUseCase,
  ToggleFormTemplateStatusUseCase,
} from '../../../application/use-cases/form-template.use-cases';
import { CreateFormTemplateDto, UpdateFormTemplateDto, FormTemplateResponseDto } from '../../../application/dtos/form-template.dto';

@ApiTags('Form & Print Template Management')
@Controller('forms')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FormTemplateController {
  constructor(
    private readonly listFormTemplatesUseCase: ListFormTemplatesUseCase,
    private readonly getFormTemplateUseCase: GetFormTemplateUseCase,
    private readonly createFormTemplateUseCase: CreateFormTemplateUseCase,
    private readonly updateFormTemplateUseCase: UpdateFormTemplateUseCase,
    private readonly toggleFormTemplateStatusUseCase: ToggleFormTemplateStatusUseCase,
  ) {}

  @Get()
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lấy danh sách mẫu biểu mẫu / mẫu in' })
  @ApiQuery({ name: 'type', required: false, description: 'Lọc theo loại' })
  @ApiQuery({ name: 'category', required: false, description: 'Lọc theo nhóm' })
  @ApiResponse({ status: 200, type: [FormTemplateResponseDto] })
  async getAll(
    @Query('type') type?: string,
    @Query('category') category?: string,
  ): Promise<FormTemplateResponseDto[]> {
    return await this.listFormTemplatesUseCase.execute(type, category);
  }

  @Get(':id')
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Xem chi tiết mẫu biểu mẫu' })
  @ApiResponse({ status: 200, type: FormTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu' })
  async getById(@Param('id') id: string): Promise<FormTemplateResponseDto> {
    return await this.getFormTemplateUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Tạo mẫu biểu mẫu mới' })
  @ApiResponse({ status: 201, type: FormTemplateResponseDto })
  @ApiResponse({ status: 409, description: 'Mã mẫu đã tồn tại' })
  async create(@Body() dto: CreateFormTemplateDto): Promise<FormTemplateResponseDto> {
    return await this.createFormTemplateUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Cập nhật mẫu biểu mẫu' })
  @ApiResponse({ status: 200, type: FormTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu' })
  async update(@Param('id') id: string, @Body() dto: UpdateFormTemplateDto): Promise<FormTemplateResponseDto> {
    return await this.updateFormTemplateUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Bật/tắt hoạt động mẫu biểu mẫu' })
  @ApiResponse({ status: 200, type: FormTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<FormTemplateResponseDto> {
    return await this.toggleFormTemplateStatusUseCase.execute(id, isActive);
  }
}
