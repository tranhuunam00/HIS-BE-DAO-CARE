import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RoleOrmEntity } from './role.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { LoginTimeWindowOrmEntity } from './login-time-window.entity';
import { UserBranchScopeOrmEntity } from './user-branch-scope.entity';
import { BranchScopeMode } from '../../domain/constants/auth.constants';

@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  username: string | null;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', nullable: true })
  refreshTokenHash: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => RoleOrmEntity, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleOrmEntity;

  @Column({ name: 'default_branch_id', type: 'uuid', nullable: true })
  defaultBranchId: string | null;

  @ManyToOne(() => BranchOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'default_branch_id' })
  defaultBranch: BranchOrmEntity | null;

  @Column({ name: 'branch_scope_mode', default: BranchScopeMode.SPECIFIC })
  branchScopeMode: string;

  @Column({ name: 'bypass_ip_restriction', default: true })
  bypassIpRestriction: boolean;

  @Column({ name: 'login_time_window_id', type: 'uuid', nullable: true })
  loginTimeWindowId: string | null;

  @ManyToOne(() => LoginTimeWindowOrmEntity, (window) => window.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'login_time_window_id' })
  loginTimeWindow: LoginTimeWindowOrmEntity | null;

  @Column({ name: 'failed_login_count', type: 'integer', default: 0 })
  failedLoginCount: number;

  @Column({ name: 'failed_login_limit', type: 'integer', nullable: true })
  failedLoginLimit: number | null;

  @Column({ name: 'locked_at', type: 'timestamp', nullable: true })
  lockedAt: Date | null;

  @Column({ name: 'locked_by', type: 'uuid', nullable: true })
  lockedBy: string | null;

  @Column({ name: 'lock_reason', type: 'varchar', nullable: true })
  lockReason: string | null;

  @OneToMany(() => UserBranchScopeOrmEntity, (scope) => scope.user)
  branchScopes: UserBranchScopeOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
