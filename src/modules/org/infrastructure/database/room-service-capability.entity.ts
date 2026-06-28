import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { RoomOrmEntity } from './room.entity';
import { ServiceOrmEntity } from '../../../medical/infrastructure/database/service.entity';

@Entity({ name: 'room_service_capabilities' })
@Unique('UQ_room_service_capability', ['roomId', 'serviceId'])
export class RoomServiceCapabilityOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId: string;

  @ManyToOne(() => RoomOrmEntity, (room) => room.serviceCapabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: RoomOrmEntity;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => ServiceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
