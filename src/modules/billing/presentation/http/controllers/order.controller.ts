import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
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
import { CreateAuditLogUseCase } from '../../../../auth/application/use-cases/create-audit-log.use-case';
import { OrderItemOrmEntity } from '../../../infrastructure/database/order-item.entity';

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
    private readonly createAuditLogUseCase: CreateAuditLogUseCase,
    private readonly dataSource: DataSource,
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
    @Req() req: any,
  ): Promise<OrderResponseDto> {
    const result = await this.addOrderItemUseCase.execute(id, dto);
    const addedItem = result.items?.find(i => i.serviceId === dto.serviceId);
    const serviceName = addedItem?.service?.name || dto.serviceId;
    const patientName = result.patient?.fullName || '';
    const visitCode = result.visit?.visitCode || '';

    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'ADD_SERVICE',
      module: 'BILLING',
      description: `Đã thêm chỉ định dịch vụ "${serviceName}" cho bệnh nhân "${patientName}" (Mã LK: ${visitCode})`,
      ipAddress: req.ip,
    });
    return result;
  }

  @Patch(':id/items/:itemId')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Cập nhật trạng thái item dịch vụ' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderItemDto,
    @Req() req: any,
  ): Promise<OrderResponseDto> {
    let serviceName = itemId;
    try {
      const item = await this.dataSource.getRepository(OrderItemOrmEntity).findOne({
        where: { id: itemId },
        relations: { service: true },
      });
      if (item?.service) {
        serviceName = item.service.name;
      }
    } catch {}

    const result = await this.updateOrderItemUseCase.execute(id, itemId, dto);
    const patientName = result.patient?.fullName || '';
    const visitCode = result.visit?.visitCode || '';

    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'UPDATE_SERVICE',
      module: 'BILLING',
      description: `Cập nhật trạng thái chỉ định "${serviceName}" thành "${dto.status || 'N/A'}" cho bệnh nhân "${patientName}" (Mã LK: ${visitCode})`,
      ipAddress: req.ip,
    });
    return result;
  }

  @Delete(':id/items/:itemId')
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Xóa item dịch vụ chưa thực hiện' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async deleteItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Req() req: any,
  ): Promise<OrderResponseDto> {
    let serviceName = itemId;
    try {
      const item = await this.dataSource.getRepository(OrderItemOrmEntity).findOne({
        where: { id: itemId },
        relations: { service: true },
      });
      if (item?.service) {
        serviceName = item.service.name;
      }
    } catch {}

    const result = await this.deleteOrderItemUseCase.execute(id, itemId);
    const patientName = result.patient?.fullName || '';
    const visitCode = result.visit?.visitCode || '';

    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'DELETE_SERVICE',
      module: 'BILLING',
      description: `Xóa chỉ định dịch vụ "${serviceName}" của bệnh nhân "${patientName}" (Mã LK: ${visitCode})`,
      ipAddress: req.ip,
    });
    return result;
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
