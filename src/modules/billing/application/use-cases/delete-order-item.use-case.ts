import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import { OrderResponseDto } from '../dtos/order.dto';
import {
  ORDER_ITEM_STATUS,
  PATIENT_VISIT_STATUS,
} from '../../../../common/constants/workflow.constants';

export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class DeleteOrderItemUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(PatientVisitOrmEntity)
    private readonly visitRepository: Repository<PatientVisitOrmEntity>,
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

    if (item.status !== ORDER_ITEM_STATUS.PENDING) {
      throw new BadRequestException(`Only pending items can be deleted. Current status: ${item.status}`);
    }

    if (item.isPaid) {
      throw new BadRequestException('Không thể xóa dịch vụ đã được thu tiền (thanh toán).');
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

    // Update patient visit status
    if (savedOrder && savedOrder.items) {
      const allCompleted = savedOrder.items.length > 0 && savedOrder.items.every(
        (i) => i.status === ORDER_ITEM_STATUS.COMPLETED || i.status === ORDER_ITEM_STATUS.CANCELLED,
      );
      const visit = await this.visitRepository.findOne({ where: { id: savedOrder.visitId } });
      if (visit) {
        if (allCompleted) {
          if (visit.status !== PATIENT_VISIT_STATUS.ALL_SERVICES_DONE) {
            visit.status = PATIENT_VISIT_STATUS.ALL_SERVICES_DONE;
            await this.visitRepository.save(visit);
          }
        }
      }
    }

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
        isPaid: i.isPaid ?? false,
        createdAt: i.createdAt!,
        updatedAt: i.updatedAt!,
        service: i.service,
      })),
    };
  }
}
