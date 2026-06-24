import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderOrmEntity } from './order.entity';

@Entity({ name: 'payments', schema: 'his' })
export class PaymentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_code', unique: true })
  paymentCode: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => OrderOrmEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderOrmEntity;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method' })
  paymentMethod: string; // CASH | TRANSFER | CARD

  @Column({ default: 'SUCCESS' })
  status: string; // SUCCESS | FAILED

  @Column({ name: 'paid_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
