import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserOrmEntity } from '../../../auth/infrastructure/database/user.entity';
import { PracticingCertificateOrmEntity } from './practicing-certificate.entity';
import { StaffAssignmentOrmEntity } from './staff-assignment.entity';

@Entity({ name: 'staff' })
export class StaffOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column()
  gender: string; // MALE, FEMALE, OTHER

  @Column({ name: 'identity_number', unique: true })
  identityNumber: string;

  @Column()
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ name: 'staff_code', unique: true })
  staffCode: string;

  @Column({ name: 'join_date', type: 'date' })
  joinDate: Date;

  @Column()
  title: string; // DOCTOR, NURSE, TECHNICIAN, RECEPTIONIST, ADMINISTRATOR, OTHER

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  nickname: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'academic_title', type: 'varchar', nullable: true })
  academicTitle: string | null;

  @Column({ type: 'varchar', nullable: true })
  degree: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true, unique: true })
  userId: string | null;

  @OneToOne(() => UserOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity | null;

  @OneToOne(() => PracticingCertificateOrmEntity, (cert) => cert.staff)
  certificate: PracticingCertificateOrmEntity;

  @OneToMany(() => StaffAssignmentOrmEntity, (assignment) => assignment.staff)
  assignments: StaffAssignmentOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
