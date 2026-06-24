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
import { ServiceOrmEntity } from '../../../medical/infrastructure/database/service.entity';

@Entity({ name: 'order_items', schema: 'his' })
export class OrderItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => OrderOrmEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderOrmEntity;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => ServiceOrmEntity)
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price: number;

  @Column({ default: 'PENDING' })
  status: string; // 'PENDING' | 'COMPLETED' | 'CANCELLED'

  @Column({ name: 'result_notes', type: 'text', nullable: true })
  resultNotes: string | null;

  @Column({ name: 'result_status', type: 'varchar', default: 'NONE' })
  resultStatus: string; // 'NONE' | 'PENDING' | 'COMPLETED'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
