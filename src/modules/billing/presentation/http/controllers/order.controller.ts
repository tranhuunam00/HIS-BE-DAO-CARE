import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { ListOrdersUseCase } from '../../../application/use-cases/list-orders.use-case';
import { GetOrderByVisitUseCase } from '../../../application/use-cases/get-order-by-visit.use-case';
import { AddOrderItemUseCase } from '../../../application/use-cases/add-order-item.use-case';
import { UpdateOrderItemUseCase } from '../../../application/use-cases/update-order-item.use-case';
import { DeleteOrderItemUseCase } from '../../../application/use-cases/delete-order-item.use-case';
import { RefundOrderUseCase } from '../../../application/use-cases/refund-order.use-case';
import { AddOrderItemDto, UpdateOrderItemDto, RefundOrderDto, OrderResponseDto } from '../../../application/dtos/order.dto';

@ApiTags('Billing - Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderByVisitUseCase: GetOrderByVisitUseCase,
    private readonly addOrderItemUseCase: AddOrderItemUseCase,
    private readonly updateOrderItemUseCase: UpdateOrderItemUseCase,
    private readonly deleteOrderItemUseCase: DeleteOrderItemUseCase,
    private readonly refundOrderUseCase: RefundOrderUseCase,
  ) {}

  @Get()
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lấy danh sách đơn dịch vụ' })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo mã đơn, mã lượt khám, tên, sđt bệnh nhân' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  async getAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<OrderResponseDto[]> {
    return await this.listOrdersUseCase.execute({ status, search });
  }

  @Get('by-visit/:visitId')
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lấy hoặc tạo đơn dịch vụ của lượt khám' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async getByVisit(@Param('visitId') visitId: string): Promise<OrderResponseDto> {
    return await this.getOrderByVisitUseCase.execute(visitId);
  }

  @Post(':id/items')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Thêm dịch vụ vào đơn' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async addItem(
    @Param('id') id: string,
    @Body() dto: AddOrderItemDto,
  ): Promise<OrderResponseDto> {
    return await this.addOrderItemUseCase.execute(id, dto);
  }

  @Patch(':id/items/:itemId')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Cập nhật trạng thái item dịch vụ' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderItemDto,
  ): Promise<OrderResponseDto> {
    return await this.updateOrderItemUseCase.execute(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Xóa item dịch vụ chưa thực hiện' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async deleteItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<OrderResponseDto> {
    return await this.deleteOrderItemUseCase.execute(id, itemId);
  }

  @Post(':id/refund')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Hoàn trả & Hủy dịch vụ trong hóa đơn đã thanh toán' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async refund(
    @Param('id') id: string,
    @Body() dto: RefundOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.refundOrderUseCase.execute(id, dto);
  }
}
