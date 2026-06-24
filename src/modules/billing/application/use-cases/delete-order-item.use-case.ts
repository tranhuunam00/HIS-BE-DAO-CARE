import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderResponseDto } from '../dtos/order.dto';

export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class DeleteOrderItemUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(orderId: string, itemId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const item = await this.orderRepository.findItemById(itemId);
    if (!item || item.orderId !== orderId) {
      throw new NotFoundException(`Order item with ID ${itemId} not found in this order`);
    }

    if (item.status !== 'PENDING') {
      throw new BadRequestException(`Only pending items can be deleted. Current status: ${item.status}`);
    }

    // Delete item
    await this.orderRepository.deleteItem(itemId);

    // Recalculate order total amount
    const updatedOrder = await this.orderRepository.findById(orderId);
    if (!updatedOrder) {
      throw new NotFoundException(`Failed to retrieve updated order`);
    }

    const totalAmount = updatedOrder.items?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;

    const savedOrder = await this.orderRepository.save({
      ...updatedOrder,
      totalAmount,
    });

    return {
      id: savedOrder.id,
      orderCode: savedOrder.orderCode,
      visitId: savedOrder.visitId,
      patientId: savedOrder.patientId,
      status: savedOrder.status,
      totalAmount: savedOrder.totalAmount,
      createdAt: savedOrder.createdAt!,
      updatedAt: savedOrder.updatedAt!,
      visit: savedOrder.visit,
      patient: savedOrder.patient,
      items: savedOrder.items?.map(i => ({
        id: i.id,
        orderId: i.orderId,
        serviceId: i.serviceId,
        quantity: i.quantity,
        price: i.price,
        status: i.status,
        createdAt: i.createdAt!,
        updatedAt: i.updatedAt!,
        service: i.service,
      })),
    };
  }
}
