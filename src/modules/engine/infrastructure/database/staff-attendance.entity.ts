import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { ShiftOrmEntity } from './shift.entity';

@Entity({ name: 'staff_attendances' })
export class StaffAttendanceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => StaffOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffOrmEntity;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => BranchOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchOrmEntity;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD string representation for date column

  @Column({ name: 'shift_id', type: 'uuid' })
  shiftId: string;

  @ManyToOne(() => ShiftOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: ShiftOrmEntity;

  @Column({ name: 'check_in_time', type: 'timestamp with time zone', nullable: true })
  checkInTime: Date | null;

  @Column({ name: 'check_out_time', type: 'timestamp with time zone', nullable: true })
  checkOutTime: Date | null;

  @Column({ name: 'checkout_reason', type: 'varchar', nullable: true })
  checkoutReason: string | null;

  @Column({ default: 'CHECKED_IN' })
  status: string; // 'CHECKED_IN' | 'CHECKED_OUT'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
