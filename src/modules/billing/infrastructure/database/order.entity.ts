import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import { PatientOrmEntity } from '../../../reception/infrastructure/database/patient.entity';
import { OrderItemOrmEntity } from './order-item.entity';

@Entity({ name: 'orders', schema: 'his' })
export class OrderOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_code', unique: true })
  orderCode: string;

  @Column({ name: 'visit_id', type: 'uuid' })
  visitId: string;

  @ManyToOne(() => PatientVisitOrmEntity)
  @JoinColumn({ name: 'visit_id' })
  visit: PatientVisitOrmEntity;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @ManyToOne(() => PatientOrmEntity)
  @JoinColumn({ name: 'patient_id' })
  patient: PatientOrmEntity;

  @Column({ default: 'PENDING' })
  status: string; // 'PENDING' | 'PAID' | 'CANCELLED'

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => OrderItemOrmEntity, (item) => item.order, { cascade: true })
  items: OrderItemOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
