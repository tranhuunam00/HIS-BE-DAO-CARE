import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { CreatePaymentUseCase } from '../../../application/use-cases/create-payment.use-case';
import { GetPaymentsByOrderUseCase } from '../../../application/use-cases/get-payments-by-order.use-case';
import { CreatePaymentDto, PaymentResponseDto } from '../../../application/dtos/payment.dto';
import { CreateAuditLogUseCase } from '../../../../auth/application/use-cases/create-audit-log.use-case';

@ApiTags('Billing - Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentsByOrderUseCase: GetPaymentsByOrderUseCase,
    private readonly createAuditLogUseCase: CreateAuditLogUseCase,
  ) {}

  @Post()
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Tạo thanh toán' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async create(@Body() dto: CreatePaymentDto, @Req() req: any): Promise<PaymentResponseDto> {
    const result = await this.createPaymentUseCase.execute(dto);

    const user = req.user;
    await this.createAuditLogUseCase.execute({
      userId: user?.sub,
      userName: user?.staffName || user?.username || user?.email,
      userRole: user?.roleName || 'N/A',
      action: 'CONFIRM_PAYMENT',
      module: 'BILLING',
      description: `Xác nhận thanh toán đơn "${result.order?.orderCode || result.orderId}" - Số tiền: ${Number(result.amount).toLocaleString('vi-VN')}đ, Phương thức: ${result.paymentMethod}, Mã thanh toán: ${result.paymentCode}`,
      ipAddress: req.ip,
    });

    return result;
  }

  @Get('by-order/:orderId')
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lịch sử thanh toán của đơn' })
  @ApiResponse({ status: 200, type: [PaymentResponseDto] })
  async getByOrder(@Param('orderId') orderId: string): Promise<PaymentResponseDto[]> {
    return await this.getPaymentsByOrderUseCase.execute(orderId);
  }
}
