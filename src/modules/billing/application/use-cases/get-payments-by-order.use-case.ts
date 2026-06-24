import { Inject, Injectable } from '@nestjs/common';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { PaymentResponseDto } from '../dtos/payment.dto';

export const IPaymentRepositoryToken = 'IPaymentRepository';

@Injectable()
export class GetPaymentsByOrderUseCase {
  constructor(
    @Inject(IPaymentRepositoryToken)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(orderId: string): Promise<PaymentResponseDto[]> {
    const list = await this.paymentRepository.findByOrderId(orderId);
    return list.map(payment => ({
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
    }));
  }
}
