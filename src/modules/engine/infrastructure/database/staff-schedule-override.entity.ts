import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { ShiftOrmEntity } from './shift.entity';
import { RoomOrmEntity } from '../../../org/infrastructure/database/room.entity';

@Entity({ name: 'staff_schedule_overrides' })
export class StaffScheduleOverrideOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => StaffOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffOrmEntity;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD string representation for date column

  @Column({ name: 'override_type' })
  overrideType: string; // 'LEAVE' | 'WORK'

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string | null;

  @ManyToOne(() => BranchOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchOrmEntity | null;

  @Column({ name: 'shift_id', type: 'uuid', nullable: true })
  shiftId: string | null;

  @ManyToOne(() => ShiftOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'shift_id' })
  shift: ShiftOrmEntity | null;

  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId: string | null;

  @ManyToOne(() => RoomOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: RoomOrmEntity | null;

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
