import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { ShiftOrmEntity } from './shift.entity';
import { RoomOrmEntity } from '../../../org/infrastructure/database/room.entity';

@Entity({ name: 'staff_schedule_templates' })
export class StaffScheduleTemplateOrmEntity {
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

  @Column({ name: 'day_of_week' })
  dayOfWeek: string; // 'Monday', 'Tuesday', ..., 'Sunday'

  @Column({ name: 'shift_id', type: 'uuid' })
  shiftId: string;

  @ManyToOne(() => ShiftOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: ShiftOrmEntity;

  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId: string | null;

  @ManyToOne(() => RoomOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: RoomOrmEntity | null;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: string; // YYYY-MM-DD string representation for date column

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
