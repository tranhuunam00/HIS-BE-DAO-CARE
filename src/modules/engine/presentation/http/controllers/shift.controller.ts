import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import {
  ListShiftsUseCase,
  CreateShiftUseCase,
  UpdateShiftUseCase,
  ToggleShiftStatusUseCase,
} from '../../../application/use-cases/shift.use-cases';
import { CreateShiftDto, UpdateShiftDto, ShiftResponseDto } from '../../../application/dtos/schedule.dto';

@ApiTags('Engine - Shifts')
@Controller('shifts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ShiftController {
  constructor(
    private readonly listShiftsUseCase: ListShiftsUseCase,
    private readonly createShiftUseCase: CreateShiftUseCase,
    private readonly updateShiftUseCase: UpdateShiftUseCase,
    private readonly toggleShiftStatusUseCase: ToggleShiftStatusUseCase,
  ) {}

  @Get()
  @RequirePermissions('schedule:read')
  @ApiOperation({ summary: 'Lấy danh sách ca trực' })
  @ApiResponse({ status: 200, type: [ShiftResponseDto] })
  async getAll(): Promise<ShiftResponseDto[]> {
    return await this.listShiftsUseCase.execute();
  }

  @Post()
  @RequirePermissions('schedule:update')
  @ApiOperation({ summary: 'Tạo ca trực mới' })
  @ApiResponse({ status: 201, type: ShiftResponseDto })
  async create(@Body() dto: CreateShiftDto): Promise<ShiftResponseDto> {
    return await this.createShiftUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('schedule:update')
  @ApiOperation({ summary: 'Cập nhật ca trực' })
  @ApiResponse({ status: 200, type: ShiftResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateShiftDto): Promise<ShiftResponseDto> {
    return await this.updateShiftUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('schedule:update')
  @ApiOperation({ summary: 'Bật/tắt hoạt động ca trực' })
  @ApiResponse({ status: 200, type: ShiftResponseDto })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<ShiftResponseDto> {
    return await this.toggleShiftStatusUseCase.execute(id, isActive);
  }
}
