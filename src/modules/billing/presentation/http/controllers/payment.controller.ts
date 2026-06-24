import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/presentation/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../auth/presentation/http/decorators/require-permissions.decorator';
import { CreatePaymentUseCase } from '../../../application/use-cases/create-payment.use-case';
import { GetPaymentsByOrderUseCase } from '../../../application/use-cases/get-payments-by-order.use-case';
import { CreatePaymentDto, PaymentResponseDto } from '../../../application/dtos/payment.dto';

@ApiTags('Billing - Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentsByOrderUseCase: GetPaymentsByOrderUseCase,
  ) {}

  @Post()
  @RequirePermissions('org:write')
  @ApiOperation({ summary: 'Tạo thanh toán' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return await this.createPaymentUseCase.execute(dto);
  }

  @Get('by-order/:orderId')
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lịch sử thanh toán của đơn' })
  @ApiResponse({ status: 200, type: [PaymentResponseDto] })
  async getByOrder(@Param('orderId') orderId: string): Promise<PaymentResponseDto[]> {
    return await this.getPaymentsByOrderUseCase.execute(orderId);
  }
}
