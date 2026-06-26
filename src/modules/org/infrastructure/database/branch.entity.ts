import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrganizationOrmEntity } from './organization.entity';
import { BRANCH_TYPE } from '../../../../common/constants/workflow.constants';
import { DEFAULT_COUNTRY_CODE } from '../../../../common/constants/global.constants';

@Entity({ name: 'branches' })
export class BranchOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: BRANCH_TYPE.CLINIC })
  type: string;

  @Column({ name: 'technical_director', type: 'varchar', nullable: true })
  technicalDirector: string | null;

  @Column({ name: 'operating_license', type: 'varchar', nullable: true })
  operatingLicense: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  hotline: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  // Address
  @Column({ default: DEFAULT_COUNTRY_CODE })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  province: string | null;

  @Column({ type: 'varchar', nullable: true })
  district: string | null;

  @Column({ name: 'address_detail', type: 'varchar', nullable: true })
  addressDetail: string | null;

  @Column({ name: 'latitude', type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ name: 'longitude', type: 'double precision', nullable: true })
  longitude: number | null;

  // Working Hours
  @Column({ name: 'working_days', type: 'simple-array', nullable: true })
  workingDays: string[] | null;

  @Column({ name: 'open_time', default: '08:00' })
  openTime: string;

  @Column({ name: 'close_time', default: '20:00' })
  closeTime: string;

  @Column({ name: 'bank_name', type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account_no', type: 'varchar', nullable: true })
  bankAccountNo: string | null;

  @Column({ name: 'bank_account_name', type: 'varchar', nullable: true })
  bankAccountName: string | null;

  @ManyToOne(() => OrganizationOrmEntity, (org) => org.branches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
