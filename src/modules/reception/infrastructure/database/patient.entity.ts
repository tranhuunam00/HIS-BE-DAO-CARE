import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'patients' })
export class PatientOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_code', unique: true })
  patientCode: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'date' })
  dob: string;

  @Column()
  gender: string; // 'MALE' | 'FEMALE' | 'OTHER'

  @Column({ unique: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  cccd: string | null;

  @Column({ name: 'guardian_name', type: 'varchar', nullable: true })
  guardianName: string | null;

  @Column({ name: 'guardian_phone', type: 'varchar', nullable: true })
  guardianPhone: string | null;

  @Column({ name: 'guardian_relation', type: 'varchar', nullable: true })
  guardianRelation: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
