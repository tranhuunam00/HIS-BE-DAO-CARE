import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BranchOrmEntity } from './branch.entity';

@Entity({ name: 'organizations' })
export class OrganizationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'short_name', type: 'varchar', nullable: true })
  shortName: string | null;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'logo_url', type: 'varchar', nullable: true })
  logoUrl: string | null;

  @Column({ name: 'tax_code', type: 'varchar', nullable: true })
  taxCode: string | null;

  @Column({ name: 'operating_license', type: 'varchar', nullable: true })
  operatingLicense: string | null;

  @Column({ name: 'legal_representative', type: 'varchar', nullable: true })
  legalRepresentative: string | null;

  @Column({ type: 'varchar', nullable: true })
  hotline: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  // Localization settings
  @Column({ default: 'vi' })
  language: string;

  @Column({ default: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @Column({ default: 'VN' })
  country: string;

  @Column({ name: 'default_currency', default: 'VND' })
  defaultCurrency: string;

  // Formats settings
  @Column({ name: 'date_format', default: 'YYYY-MM-DD' })
  dateFormat: string;

  @Column({ name: 'time_format', default: 'HH:mm:ss' })
  timeFormat: string;

  @Column({ name: 'currency_format', default: 'standard' })
  currencyFormat: string;

  @Column({ name: 'otp_expiration_time', type: 'integer', default: 300 })
  otpExpirationTime: number;

  @Column({ name: 'appointment_cancellation_limit', type: 'integer', default: 24 })
  appointmentCancellationLimit: number;

  // Identifier formats
  @Column({ name: 'mrn_format', default: 'MRN-{YY}{MM}{DD}-{SEQ}' })
  mrnFormat: string;

  @Column({ name: 'patient_code_format', default: 'PT-{YY}{MM}-{SEQ}' })
  patientCodeFormat: string;

  @Column({ name: 'visit_code_format', default: 'VS-{YY}{MM}{DD}-{SEQ}' })
  visitCodeFormat: string;

  @OneToMany(() => BranchOrmEntity, (branch) => branch.organization)
  branches: BranchOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
