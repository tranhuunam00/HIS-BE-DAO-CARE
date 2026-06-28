import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ServiceOrmEntity } from '../../../medical/infrastructure/database/service.entity';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import { AddOrderItemDto, OrderResponseDto } from '../dtos/order.dto';
import {
  ORDER_ITEM_STATUS,
  PATIENT_VISIT_STATUS,
  SERVICE_PRICE_TYPE,
} from '../../../../common/constants/workflow.constants';

export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class AddOrderItemUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(ServiceOrmEntity)
    private readonly serviceRepository: Repository<ServiceOrmEntity>,
    @InjectRepository(PatientVisitOrmEntity)
    private readonly visitRepository: Repository<PatientVisitOrmEntity>,
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
      price = this.getActivePriceAtDate(service.prices || [], order.createdAt || new Date());
    }

    // Save item
    await this.orderRepository.saveItem({
      orderId,
      serviceId: dto.serviceId,
      quantity,
      price,
      status: ORDER_ITEM_STATUS.PENDING,
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
      // If order was already PAID but we're adding a new (unpaid) item, reset to PENDING
      status: updatedOrder.status === 'PAID' ? 'PENDING' : updatedOrder.status,
    });

    // Update patient visit status to PENDING_PAYMENT
    const visit = await this.visitRepository.findOne({ where: { id: savedOrder.visitId } });
    if (visit && visit.status !== PATIENT_VISIT_STATUS.PENDING_PAYMENT && this.shouldMoveVisitToPendingPayment(visit.status)) {
      visit.status = PATIENT_VISIT_STATUS.PENDING_PAYMENT;
      await this.visitRepository.save(visit);
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
      items: savedOrder.items?.map(item => ({
        id: item.id,
        orderId: item.orderId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        isPaid: item.isPaid ?? false,
        resultNotes: item.resultNotes,
        resultStatus: item.resultStatus,
        createdAt: item.createdAt!,
        updatedAt: item.updatedAt!,
        service: item.service,
      })),
    };
  }

  private shouldMoveVisitToPendingPayment(status: string): boolean {
    return status === PATIENT_VISIT_STATUS.ADMITTED || status === PATIENT_VISIT_STATUS.CLINICAL_EXAM_DONE || status === PATIENT_VISIT_STATUS.WAITING_RESULTS;
  }

  private getActivePriceAtDate(prices: any[], targetDate: Date): number {
    if (!prices || prices.length === 0) {
      return 0;
    }

    const listedPrices = prices.filter(p => p.priceType === 'LISTED');
    if (listedPrices.length === 0) {
      return prices[0] ? Number(prices[0].amount) : 0;
    }

    const targetTime = new Date(targetDate).setHours(0, 0, 0, 0);

    const eligiblePrices = listedPrices.filter(p => {
      const effTime = new Date(p.effectiveDate).setHours(0, 0, 0, 0);
      return effTime <= targetTime;
    });

    if (eligiblePrices.length === 0) {
      const sortedByDateAsc = [...listedPrices].sort((a, b) => 
        new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime()
      );
      return Number(sortedByDateAsc[0].amount);
    }

    const sortedByDateDesc = eligiblePrices.sort((a, b) => 
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );

    return Number(sortedByDateDesc[0].amount);
  }
}
