import { Inject, Injectable } from '@nestjs/common';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderResponseDto } from '../dtos/order.dto';

export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(filters?: { status?: string; search?: string }): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll(filters);
    return orders.map(order => ({
      id: order.id,
      orderCode: order.orderCode,
      visitId: order.visitId,
      patientId: order.patientId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt!,
      updatedAt: order.updatedAt!,
      visit: order.visit,
      patient: order.patient,
      items: order.items?.map(item => ({
        id: item.id,
        orderId: item.orderId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        isPaid: item.isPaid ?? false,
        resultNotes: item.resultNotes,
        resultStatus: item.resultStatus,
        performedById: item.performedById,
        performedBy: item.performedBy,
        createdAt: item.createdAt!,
        updatedAt: item.updatedAt!,
        service: item.service
      }))
    }));
  }
}
