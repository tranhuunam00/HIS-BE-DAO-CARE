import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { Payment } from '../../domain/entities/payment.model';
import { PaymentOrmEntity } from '../database/payment.entity';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly ormRepository: Repository<PaymentOrmEntity>,
  ) {}

  private mapToDomain(entity: PaymentOrmEntity): Payment {
    return new Payment(
      entity.id,
      entity.paymentCode,
      entity.orderId,
      Number(entity.amount),
      entity.paymentMethod,
      entity.status,
      entity.paidAt,
      entity.createdAt,
      entity.updatedAt,
      entity.order,
    );
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    const entities = await this.ormRepository.find({
      where: { orderId },
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapToDomain(e));
  }

  async findById(id: string): Promise<Payment | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: { order: true },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async save(payment: Omit<Payment, 'id'> & { id?: string }): Promise<Payment> {
    const entity = this.ormRepository.create(payment);
    const saved = await this.ormRepository.save(entity);
    const reFetched = await this.findById(saved.id);
    return reFetched!;
  }

  async generatePaymentCode(): Promise<string> {
    const count = await this.ormRepository.count();
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '').slice(2);
    const nextSeq = (count + 1).toString().padStart(4, '0');
    return `PAY${today}-${nextSeq}`;
  }
}
