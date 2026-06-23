import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { StaffOrmEntity } from './staff.entity';

@Entity({ name: 'practicing_certificates' })
export class PracticingCertificateOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'staff_id', type: 'uuid', unique: true })
  staffId: string;

  @Column({ name: 'certificate_number', unique: true })
  certificateNumber: string;

  @Column({ name: 'issued_date', type: 'date' })
  issuedDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date | null;

  @Column({ name: 'issued_by' })
  issuedBy: string;

  @Column({ name: 'scope_of_practice', type: 'text' })
  scopeOfPractice: string;

  @Column({ name: 'signature_scan_url', type: 'varchar', nullable: true })
  signatureScanUrl: string | null;

  @OneToOne(() => StaffOrmEntity, (staff) => staff.certificate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
