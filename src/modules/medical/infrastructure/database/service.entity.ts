import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ServicePriceOrmEntity } from './service-price.entity';

@Entity({ name: 'services' })
export class ServiceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'specialty_id', type: 'uuid', nullable: true })
  specialtyId: string | null;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ default: 'EXAMINATION' })
  category: string; // EXAMINATION | LAB_TEST | IMAGING | PROCEDURE | SURGERY | THERAPY

  @Column({ name: 'insurance_code', type: 'varchar', nullable: true })
  insuranceCode: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'duration_minutes', type: 'integer', default: 30 })
  durationMinutes: number;

  @Column({ name: 'result_duration_hours', type: 'integer', nullable: true })
  resultDurationHours: number | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ServicePriceOrmEntity, (price) => price.service)
  prices: ServicePriceOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
