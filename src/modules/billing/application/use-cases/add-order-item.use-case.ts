import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ServiceOrmEntity } from '../../../medical/infrastructure/database/service.entity';
import { AddOrderItemDto, OrderResponseDto } from '../dtos/order.dto';

export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class AddOrderItemUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(ServiceOrmEntity)
    private readonly serviceRepository: Repository<ServiceOrmEntity>,
  ) {}

  async execute(orderId: string, dto: AddOrderItemDto): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const service = await this.serviceRepository.findOne({
      where: { id: dto.serviceId },
      relations: { prices: true },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${dto.serviceId} not found`);
    }

    const quantity = dto.quantity || 1;
    let price = 0;
    if (dto.price !== undefined) {
      price = dto.price;
    } else {
      // Find listed price or fallback to first price or 0
      const listedPrice = service.prices?.find(p => p.priceType === 'LISTED');
      price = listedPrice ? Number(listedPrice.amount) : (service.prices?.[0] ? Number(service.prices[0].amount) : 0);
    }

    // Save item
    await this.orderRepository.saveItem({
      orderId,
      serviceId: dto.serviceId,
      quantity,
      price,
      status: 'PENDING',
    });

    // Recalculate order total amount
    const updatedOrder = await this.orderRepository.findById(orderId);
    if (!updatedOrder) {
      throw new NotFoundException(`Failed to retrieve updated order`);
    }

    const totalAmount = updatedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

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
      items: savedOrder.items?.map(item => ({
        id: item.id,
        orderId: item.orderId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        createdAt: item.createdAt!,
        updatedAt: item.updatedAt!,
        service: item.service,
      })),
    };
  }
}
