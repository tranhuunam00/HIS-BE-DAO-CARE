import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PatientOrmEntity } from './patient.entity';
import { BranchOrmEntity } from '../../../../modules/org/infrastructure/database/branch.entity';
import { StaffOrmEntity } from '../../../../modules/org/infrastructure/database/staff.entity';
import { RoomOrmEntity } from '../../../../modules/org/infrastructure/database/room.entity';
import { ServiceOrmEntity } from '../../../../modules/medical/infrastructure/database/service.entity';

@Entity({ name: 'appointments' })
export class AppointmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_code', unique: true })
  appointmentCode: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => PatientOrmEntity)
  @JoinColumn({ name: 'patient_id' })
  patient: PatientOrmEntity;

  @Column({ name: 'branch_id' })
  branchId: string;

  @ManyToOne(() => BranchOrmEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchOrmEntity;

  @Column({ name: 'doctor_id', type: 'varchar', nullable: true })
  doctorId: string | null;

  @ManyToOne(() => StaffOrmEntity, { nullable: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: StaffOrmEntity | null;

  @Column({ name: 'room_id', type: 'varchar', nullable: true })
  roomId: string | null;

  @ManyToOne(() => RoomOrmEntity, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: RoomOrmEntity | null;

  @Column({ name: 'service_id', type: 'varchar', nullable: true })
  serviceId: string | null;

  @Column({ name: 'specialty_id', type: 'varchar', nullable: true })
  specialtyId: string | null;

  @ManyToOne(() => ServiceOrmEntity, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity | null;

  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: string;

  @Column({ name: 'start_time' })
  startTime: string; // e.g. '09:00'

  @Column({ name: 'end_time' })
  endTime: string; // e.g. '09:30'

  @Column()
  status: string; // 'BOOKED' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED'

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ name: 'is_guest', type: 'boolean', default: false })
  isGuest: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
