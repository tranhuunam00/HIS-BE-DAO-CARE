import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import { UpdateOrderItemDto, OrderResponseDto } from '../dtos/order.dto';
import {
  ORDER_ITEM_STATUS,
  PATIENT_VISIT_STATUS,
} from '../../../../common/constants/workflow.constants';

export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class UpdateOrderItemUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(PatientVisitOrmEntity)
    private readonly visitRepository: Repository<PatientVisitOrmEntity>,
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
      resultNotes: dto.resultNotes !== undefined ? dto.resultNotes : item.resultNotes,
      resultStatus: dto.resultStatus !== undefined ? dto.resultStatus : item.resultStatus,
      performedById: dto.performedById !== undefined ? dto.performedById : item.performedById,
    });

    const savedOrder = await this.orderRepository.findById(orderId);

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
        } else {
          // If some items are completed (or executing), set visit status to IN_SERVICE
          const hasCompleted = savedOrder.items.some((i) => i.status === ORDER_ITEM_STATUS.COMPLETED);
          if (hasCompleted && visit.status === PATIENT_VISIT_STATUS.WAITING_SERVICE) {
            visit.status = PATIENT_VISIT_STATUS.IN_SERVICE;
            await this.visitRepository.save(visit);
          }
        }
      }
    }
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
        isPaid: i.isPaid ?? false,
        resultNotes: i.resultNotes,
        resultStatus: i.resultStatus,
        performedById: i.performedById,
        createdAt: i.createdAt!,
        updatedAt: i.updatedAt!,
        service: i.service,
      })),
    };
  }
}
