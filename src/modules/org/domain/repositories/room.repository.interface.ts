import { Room } from '../entities/room.model';

export interface IRoomRepository {
  findAll(branchId?: string): Promise<Room[]>;
  findById(id: string): Promise<Room | null>;
  findByCode(code: string): Promise<Room | null>;
  save(room: Room): Promise<Room>;
}

export const IRoomRepositoryToken = Symbol('IRoomRepository');
