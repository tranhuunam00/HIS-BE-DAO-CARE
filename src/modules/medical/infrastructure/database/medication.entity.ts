import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MEDICATION_ROUTE } from '../../../../common/constants/workflow.constants';

@Entity({ name: 'medications' })
export class MedicationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'national_code', type: 'varchar', nullable: true, unique: true })
  nationalCode: string | null;

  @Column()
  name: string;

  @Column({ name: 'active_ingredient' })
  activeIngredient: string;

  @Column()
  concentration: string;

  @Column()
  unit: string;

  @Column({ name: 'usage_unit', type: 'varchar', nullable: true })
  usageUnit: string | null;

  @Column({ name: 'route_of_administration', default: MEDICATION_ROUTE.ORAL })
  routeOfAdministration: string; // ORAL | INJECTION | TOPICAL | INHALATION | OTHER

  @Column({ name: 'max_dose_per_day', type: 'varchar', nullable: true })
  maxDosePerDay: string | null;

  @Column({ name: 'group_name', type: 'varchar', nullable: true })
  groupName: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
