import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { UserOrmEntity } from './user.entity';
import { RoleOrmEntity } from './role.entity';
import { BranchOrmEntity } from '../../../../modules/org/infrastructure/database/branch.entity';

@Entity({ name: 'scoped_permissions' })
@Unique('UQ_user_scoped_perm', ['userId', 'branchId'])
@Unique('UQ_role_scoped_perm', ['roleId', 'branchId'])
export class ScopedPermissionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity | null;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string | null;

  @ManyToOne(() => RoleOrmEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: RoleOrmEntity | null;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => BranchOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchOrmEntity;

  @Column({ name: 'can_view', default: false })
  canView: boolean;

  @Column({ name: 'can_read', default: false })
  canRead: boolean;

  @Column({ name: 'can_approve', default: false })
  canApprove: boolean;

  @Column({ name: 'can_consult', default: false })
  canConsult: boolean;

  @Column({ name: 'can_cancel_consult', default: false })
  canCancelConsult: boolean;

  @Column({ name: 'can_edit', default: false })
  canEdit: boolean;

  @Column({ name: 'can_delete', default: false })
  canDelete: boolean;

  @Column({ name: 'can_update_his', default: false })
  canUpdateHis: boolean;

  @Column({ name: 'can_share', default: false })
  canShare: boolean;

  @Column({ name: 'can_stats', default: false })
  canStats: boolean;

  @Column({ name: 'can_cancel_approve', default: false })
  canCancelApprove: boolean;

  @Column({ name: 'can_delete_series', default: false })
  canDeleteSeries: boolean;

  @Column({ name: 'can_view_history', default: false })
  canViewHistory: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
