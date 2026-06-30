import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListRoomsUseCase } from '../../../application/use-cases/list-rooms.use-case';
import { GetRoomUseCase } from '../../../application/use-cases/get-room.use-case';
import { CreateRoomUseCase } from '../../../application/use-cases/create-room.use-case';
import { UpdateRoomUseCase } from '../../../application/use-cases/update-room.use-case';
import { ToggleRoomStatusUseCase } from '../../../application/use-cases/toggle-room-status.use-case';
import { AssignStaffsToRoomUseCase } from '../../../application/use-cases/assign-staffs-to-room.use-case';
import { CreateRoomDto, UpdateRoomDto, RoomResponseDto } from '../../../application/dtos/room.dto';

@ApiTags('Room Management')
@Controller('rooms')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RoomController {
  constructor(
    private readonly listRoomsUseCase: ListRoomsUseCase,
    private readonly getRoomUseCase: GetRoomUseCase,
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly toggleRoomStatusUseCase: ToggleRoomStatusUseCase,
    private readonly assignStaffsToRoomUseCase: AssignStaffsToRoomUseCase
  ) {}

  @Get()
  @RequirePermissions('room:read')
  @ApiOperation({ summary: 'Lấy danh sách phòng khám' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Lọc phòng theo ID chi nhánh' })
  @ApiResponse({ status: 200, type: [RoomResponseDto], description: 'Trả về danh sách phòng' })
  async getAll(@Query('branchId') branchId?: string): Promise<RoomResponseDto[]> {
    return await this.listRoomsUseCase.execute(branchId);
  }

  @Get(':id')
  @RequirePermissions('room:read')
  @ApiOperation({ summary: 'Xem chi tiết phòng khám' })
  @ApiResponse({ status: 200, type: RoomResponseDto, description: 'Trả về chi tiết phòng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng' })
  async getById(@Param('id') id: string): Promise<RoomResponseDto> {
    return await this.getRoomUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('room:write')
  @ApiOperation({ summary: 'Tạo mới phòng khám' })
  @ApiResponse({ status: 201, type: RoomResponseDto, description: 'Tạo phòng thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Mã phòng đã tồn tại' })
  async create(@Body() dto: CreateRoomDto): Promise<RoomResponseDto> {
    return await this.createRoomUseCase.execute(dto);
  }

  @Put(':id')
  @RequirePermissions('room:write')
  @ApiOperation({ summary: 'Cập nhật thông tin phòng khám' })
  @ApiResponse({ status: 200, type: RoomResponseDto, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoomDto): Promise<RoomResponseDto> {
    return await this.updateRoomUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('room:write')
  @ApiOperation({ summary: 'Bật/tắt trạng thái hoạt động của phòng' })
  @ApiResponse({ status: 200, type: RoomResponseDto, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ): Promise<RoomResponseDto> {
    return await this.toggleRoomStatusUseCase.execute(id, isActive);
  }

  @Post(':id/staffs')
  @RequirePermissions('room:write')
  @ApiOperation({ summary: 'Phân công hàng loạt nhân sự vào phòng khám' })
  @ApiResponse({ status: 200, description: 'Phân công thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng hoặc nhân sự' })
  async assignStaffs(
    @Param('id') id: string,
    @Body('staffIds') staffIds: string[]
  ): Promise<void> {
    await this.assignStaffsToRoomUseCase.execute(id, staffIds);
  }
}
