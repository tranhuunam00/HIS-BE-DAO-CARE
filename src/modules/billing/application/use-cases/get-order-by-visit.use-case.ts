import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import { OrderResponseDto } from '../dtos/order.dto';

export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class GetOrderByVisitUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(PatientVisitOrmEntity)
    private readonly visitRepository: Repository<PatientVisitOrmEntity>,
  ) {}

  async execute(visitId: string): Promise<OrderResponseDto> {
    let order = await this.orderRepository.findByVisitId(visitId);
    if (!order) {
      // Find patient visit
      const visit = await this.visitRepository.findOne({
        where: { id: visitId },
      });
      if (!visit) {
        throw new NotFoundException(`Patient visit with ID ${visitId} not found`);
      }

      // Generate order code
      const orderCode = await this.orderRepository.generateOrderCode();

      // Create new order
      order = await this.orderRepository.save({
        orderCode,
        visitId,
        patientId: visit.patientId,
        status: 'PENDING',
        totalAmount: 0,
      });
    }

    return {
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
        resultNotes: item.resultNotes,
        resultStatus: item.resultStatus,
        createdAt: item.createdAt!,
        updatedAt: item.updatedAt!,
        service: item.service,
      })),
    };
  }
}
