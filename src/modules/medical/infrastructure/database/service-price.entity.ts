import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceOrmEntity } from './service.entity';

@Entity({ name: 'service_prices' })
export class ServicePriceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'price_type' })
  priceType: string; // LISTED | INSURANCE | VIP

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatRate: number;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @ManyToOne(() => ServiceOrmEntity, (service) => service.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
