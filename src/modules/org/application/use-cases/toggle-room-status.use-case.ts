import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import type { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { RoomResponseDto } from '../dtos/room.dto';
import { Room } from '../../domain/entities/room.model';

@Injectable()
export class ToggleRoomStatusUseCase {
  constructor(
    @Inject(IRoomRepositoryToken)
    private readonly roomRepository: IRoomRepository
  ) {}

  async execute(id: string, isActive: boolean): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID "${id}"`);
    }

    const updatedRoom = new Room(
      room.id,
      room.branchId,
      room.name,
      room.code,
      room.type,
      room.specialtyId,
      room.floor,
      room.capacity,
      isActive,
      room.createdAt,
      new Date()
    );

    const saved = await this.roomRepository.save(updatedRoom);
    return {
      id: saved.id,
      branchId: saved.branchId,
      name: saved.name,
      code: saved.code,
      type: saved.type,
      specialtyId: saved.specialtyId,
      floor: saved.floor,
      capacity: saved.capacity,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
