import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BranchOrmEntity } from './branch.entity';
import { StaffOrmEntity } from './staff.entity';

@Entity({ name: 'departments' })
export class DepartmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string | null;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => BranchOrmEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchOrmEntity | null;



  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
