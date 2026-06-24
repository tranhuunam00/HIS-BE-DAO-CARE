import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RoomOrmEntity } from './room.entity';

@Entity({ name: 'resources' })
export class ResourceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id' })
  roomId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  type: string; // CHAIR, BED, EQUIPMENT

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_occupied', default: false })
  isOccupied: boolean;

  @ManyToOne(() => RoomOrmEntity, (room) => room.resources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: RoomOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
