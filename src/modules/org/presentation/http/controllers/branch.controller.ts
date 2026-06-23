import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListBranchesUseCase } from '../../../application/use-cases/list-branches.use-case';
import { GetBranchUseCase } from '../../../application/use-cases/get-branch.use-case';
import { CreateBranchUseCase } from '../../../application/use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from '../../../application/use-cases/update-branch.use-case';
import { DeactivateBranchUseCase } from '../../../application/use-cases/deactivate-branch.use-case';
import { CreateBranchDto, UpdateBranchDto, BranchResponseDto } from '../../../application/dtos/branch.dto';

@ApiTags('Branch Management')
@Controller('branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class BranchController {
  constructor(
    private readonly listBranchesUseCase: ListBranchesUseCase,
    private readonly getBranchUseCase: GetBranchUseCase,
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
    private readonly deactivateBranchUseCase: DeactivateBranchUseCase
  ) {}

  @Get()
  @RequirePermissions('branch:read')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các chi nhánh' })
  @ApiResponse({ status: 200, type: [BranchResponseDto], description: 'Trả về danh sách chi nhánh' })
  async getAll(): Promise<BranchResponseDto[]> {
    return await this.listBranchesUseCase.execute();
  }

  @Get(':id')
  @RequirePermissions('branch:read')
  @ApiOperation({ summary: 'Xem chi tiết một chi nhánh' })
  @ApiResponse({ status: 200, type: BranchResponseDto, description: 'Trả về chi tiết chi nhánh' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  async getById(@Param('id') id: string): Promise<BranchResponseDto> {
    return await this.getBranchUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('branch:create')
  @ApiOperation({ summary: 'Tạo mới một chi nhánh' })
  @ApiResponse({ status: 201, type: BranchResponseDto, description: 'Chi nhánh được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Mã chi nhánh đã tồn tại' })
  async create(@Body() dto: CreateBranchDto): Promise<BranchResponseDto> {
    return await this.createBranchUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('branch:update')
  @ApiOperation({ summary: 'Cập nhật thông tin chi nhánh' })
  @ApiResponse({ status: 200, type: BranchResponseDto, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto): Promise<BranchResponseDto> {
    return await this.updateBranchUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('branch:update')
  @ApiOperation({ summary: 'Bật/tắt trạng thái hoạt động của chi nhánh' })
  @ApiResponse({ status: 200, type: BranchResponseDto, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ): Promise<BranchResponseDto> {
    return await this.deactivateBranchUseCase.execute(id, isActive);
  }
}
