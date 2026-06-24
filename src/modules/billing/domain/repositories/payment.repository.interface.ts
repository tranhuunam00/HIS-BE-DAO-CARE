import { Payment } from '../entities/payment.model';

export interface IPaymentRepository {
  findByOrderId(orderId: string): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;
  save(payment: Omit<Payment, 'id'> & { id?: string }): Promise<Payment>;
  generatePaymentCode(): Promise<string>;
}
