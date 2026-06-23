import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListResourcesUseCase } from '../../../application/use-cases/list-resources.use-case';
import { CreateResourceUseCase } from '../../../application/use-cases/create-resource.use-case';
import { UpdateResourceUseCase } from '../../../application/use-cases/update-resource.use-case';
import { ToggleResourceStatusUseCase } from '../../../application/use-cases/toggle-resource-status.use-case';
import { CreateResourceDto, UpdateResourceDto, ResourceResponseDto } from '../../../application/dtos/resource.dto';

@ApiTags('Resource Management')
@Controller('resources')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ResourceController {
  constructor(
    private readonly listResourcesUseCase: ListResourcesUseCase,
    private readonly createResourceUseCase: CreateResourceUseCase,
    private readonly updateResourceUseCase: UpdateResourceUseCase,
    private readonly toggleResourceStatusUseCase: ToggleResourceStatusUseCase
  ) {}

  @Get()
  @RequirePermissions('resource:read')
  @ApiOperation({ summary: 'Lấy danh sách tài nguyên y khoa (giường, ghế, thiết bị)' })
  @ApiQuery({ name: 'roomId', required: false, description: 'Lọc tài nguyên theo ID phòng' })
  @ApiResponse({ status: 200, type: [ResourceResponseDto], description: 'Trả về danh sách tài nguyên' })
  async getAll(@Query('roomId') roomId?: string): Promise<ResourceResponseDto[]> {
    return await this.listResourcesUseCase.execute(roomId);
  }

  @Post()
  @RequirePermissions('resource:write')
  @ApiOperation({ summary: 'Thêm tài nguyên mới vào phòng khám' })
  @ApiResponse({ status: 201, type: ResourceResponseDto, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Mã tài nguyên đã tồn tại' })
  async create(@Body() dto: CreateResourceDto): Promise<ResourceResponseDto> {
    return await this.createResourceUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('resource:write')
  @ApiOperation({ summary: 'Cập nhật tài nguyên y khoa' })
  @ApiResponse({ status: 200, type: ResourceResponseDto, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài nguyên' })
  async update(@Param('id') id: string, @Body() dto: UpdateResourceDto): Promise<ResourceResponseDto> {
    return await this.updateResourceUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('resource:write')
  @ApiOperation({ summary: 'Bật/tắt trạng thái hoạt động của tài nguyên' })
  @ApiResponse({ status: 200, type: ResourceResponseDto, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài nguyên' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ): Promise<ResourceResponseDto> {
    return await this.toggleResourceStatusUseCase.execute(id, isActive);
  }
}
