import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PatientOrmEntity } from './patient.entity';
import { AppointmentOrmEntity } from './appointment.entity';
import { BranchOrmEntity } from '../../../../modules/org/infrastructure/database/branch.entity';
import { StaffOrmEntity } from '../../../../modules/org/infrastructure/database/staff.entity';
import { RoomOrmEntity } from '../../../../modules/org/infrastructure/database/room.entity';

@Entity({ name: 'patient_visits' })
export class PatientVisitOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'visit_code', unique: true })
  visitCode: string;

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

  @Column({ name: 'appointment_id', type: 'varchar', nullable: true })
  appointmentId: string | null;

  @ManyToOne(() => AppointmentOrmEntity, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: AppointmentOrmEntity | null;

  @Column({ name: 'current_room_id', type: 'varchar', nullable: true })
  currentRoomId: string | null;

  @ManyToOne(() => RoomOrmEntity, { nullable: true })
  @JoinColumn({ name: 'current_room_id' })
  currentRoom: RoomOrmEntity | null;

  @Column({ name: 'current_doctor_id', type: 'varchar', nullable: true })
  currentDoctorId: string | null;

  @ManyToOne(() => StaffOrmEntity, { nullable: true })
  @JoinColumn({ name: 'current_doctor_id' })
  currentDoctor: StaffOrmEntity | null;

  @Column({ name: 'current_nurse_id', type: 'varchar', nullable: true })
  currentNurseId: string | null;

  @ManyToOne(() => StaffOrmEntity, { nullable: true })
  @JoinColumn({ name: 'current_nurse_id' })
  currentNurse: StaffOrmEntity | null;

  @Column({ name: 'queue_number' })
  queueNumber: number; // STT in the day

  @Column()
  status: string; // 'WAITING' | 'IN_ROOM' | 'COMPLETED' | 'CANCELLED'

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  // Vital Signs
  @Column({ type: 'integer', nullable: true })
  pulse: number | null; // Mạch (nhịp/phút)

  @Column({ name: 'blood_pressure', type: 'varchar', nullable: true })
  bloodPressure: string | null; // Huyết áp (e.g. '120/80')

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number | null; // Nhiệt độ (°C)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number | null; // Cân nặng (kg)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number | null; // Chiều cao (cm)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
