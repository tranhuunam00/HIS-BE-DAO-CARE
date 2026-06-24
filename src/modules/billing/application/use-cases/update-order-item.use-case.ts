import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { UpdateOrderItemDto, OrderResponseDto } from '../dtos/order.dto';

export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class UpdateOrderItemUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(orderId: string, itemId: string, dto: UpdateOrderItemDto): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const item = await this.orderRepository.findItemById(itemId);
    if (!item || item.orderId !== orderId) {
      throw new NotFoundException(`Order item with ID ${itemId} not found in this order`);
    }

    // Save updated status
    await this.orderRepository.saveItem({
      ...item,
      status: dto.status,
    });

    const savedOrder = await this.orderRepository.findById(orderId);
    return {
      id: savedOrder!.id,
      orderCode: savedOrder!.orderCode,
      visitId: savedOrder!.visitId,
      patientId: savedOrder!.patientId,
      status: savedOrder!.status,
      totalAmount: savedOrder!.totalAmount,
      createdAt: savedOrder!.createdAt!,
      updatedAt: savedOrder!.updatedAt!,
      visit: savedOrder!.visit,
      patient: savedOrder!.patient,
      items: savedOrder!.items?.map(i => ({
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
