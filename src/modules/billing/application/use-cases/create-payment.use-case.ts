import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderItemOrmEntity } from '../../infrastructure/database/order-item.entity';
import { CreatePaymentDto, PaymentResponseDto } from '../dtos/payment.dto';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../../../common/constants/workflow.constants';

export const IPaymentRepositoryToken = 'IPaymentRepository';
export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(IPaymentRepositoryToken)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(OrderItemOrmEntity)
    private readonly itemRepository: Repository<OrderItemOrmEntity>,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    const unpaidItems = order.items?.filter((item) => !item.isPaid) || [];
    if (unpaidItems.length === 0) {
      throw new BadRequestException('Order has no unpaid items');
    }

    const paymentCode = await this.paymentRepository.generatePaymentCode();

    const payment = await this.paymentRepository.save({
      paymentCode,
      orderId: dto.orderId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      status: PAYMENT_STATUS.SUCCESS,
    });

    // Update order status first. Saving the loaded order cascades its current
    // item snapshot, so item payment flags must be written after this save.
    await this.orderRepository.save({
      ...order,
      status: ORDER_STATUS.PAID,
    });

    // Mark all current unpaid items of this order as isPaid = true
    await this.itemRepository.update(
      { orderId: dto.orderId, isPaid: false },
      { isPaid: true },
    );

    return {
      id: payment.id,
      paymentCode: payment.paymentCode,
      orderId: payment.orderId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      paidAt: payment.paidAt!,
      createdAt: payment.createdAt!,
      updatedAt: payment.updatedAt!,
      order: payment.order,
    };
  }
}
