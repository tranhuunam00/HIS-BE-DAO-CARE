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
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import {
  ORDER_ITEM_RESULT_STATUS,
  ORDER_ITEM_STATUS,
} from '../../../../common/constants/workflow.constants';

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

  @Column({ default: ORDER_ITEM_STATUS.PENDING })
  status: string; // 'PENDING' | 'COMPLETED' | 'CANCELLED'

  @Column({ name: 'result_notes', type: 'text', nullable: true })
  resultNotes: string | null;

  @Column({ name: 'performed_by_id', type: 'uuid', nullable: true })
  performedById: string | null;

  @ManyToOne(() => StaffOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'performed_by_id' })
  performedBy: StaffOrmEntity | null;

  @Column({ name: 'result_status', type: 'varchar', default: ORDER_ITEM_RESULT_STATUS.NONE })
  resultStatus: string; // 'NONE' | 'PENDING' | 'COMPLETED'

  @Column({ name: 'is_paid', type: 'boolean', default: false })
  isPaid: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
