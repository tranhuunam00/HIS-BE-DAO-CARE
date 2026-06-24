import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import { CreatePaymentDto, PaymentResponseDto } from '../dtos/payment.dto';

export const IPaymentRepositoryToken = 'IPaymentRepository';
export const IOrderRepositoryToken = 'IOrderRepository';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(IPaymentRepositoryToken)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(PatientVisitOrmEntity)
    private readonly visitRepository: Repository<PatientVisitOrmEntity>,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    const paymentCode = await this.paymentRepository.generatePaymentCode();

    const payment = await this.paymentRepository.save({
      paymentCode,
      orderId: dto.orderId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      status: 'SUCCESS',
    });

    // Update order status to PAID
    await this.orderRepository.save({
      ...order,
      status: 'PAID',
    });

    // Update patient visit status to WAITING_SERVICE
    const visit = await this.visitRepository.findOne({ where: { id: order.visitId } });
    if (visit) {
      visit.status = 'WAITING_SERVICE';
      await this.visitRepository.save(visit);
    }

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

