import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BranchOrmEntity } from './branch.entity';
import { ResourceOrmEntity } from './resource.entity';
import { RoomServiceCapabilityOrmEntity } from './room-service-capability.entity';
import { ROOM_TYPE } from '../../../../common/constants/workflow.constants';

@Entity({ name: 'rooms' })
export class RoomOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: ROOM_TYPE.CLINIC })
  type: string; // CLINIC, TREATMENT, PROCEDURE, LABORATORY, IMAGING

  @Column({ name: 'specialty_id', type: 'uuid', nullable: true })
  specialtyId: string | null;

  @Column({ type: 'varchar', nullable: true })
  floor: string | null;

  @Column({ type: 'integer', default: 1 })
  capacity: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => BranchOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchOrmEntity;

  @OneToMany(() => ResourceOrmEntity, (resource) => resource.room)
  resources: ResourceOrmEntity[];

  @OneToMany(() => RoomServiceCapabilityOrmEntity, (capability) => capability.room, { cascade: true })
  serviceCapabilities: RoomServiceCapabilityOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
