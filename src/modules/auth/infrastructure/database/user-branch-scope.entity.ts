import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { UserOrmEntity } from './user.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';

@Entity({ name: 'user_branch_scopes' })
@Unique(['userId', 'branchId'])
export class UserBranchScopeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.branchScopes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => BranchOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
