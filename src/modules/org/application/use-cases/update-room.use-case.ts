import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import type { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { UpdateRoomDto, RoomResponseDto } from '../dtos/room.dto';
import { Room } from '../../domain/entities/room.model';

@Injectable()
export class UpdateRoomUseCase {
  constructor(
    @Inject(IRoomRepositoryToken)
    private readonly roomRepository: IRoomRepository
  ) {}

  async execute(id: string, dto: UpdateRoomDto): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID "${id}"`);
    }

    const updatedRoom = new Room(
      room.id,
      room.branchId,
      dto.name !== undefined ? dto.name : room.name,
      room.code, // Code stays readonly for update as per route design or matches code in DB
      dto.type !== undefined ? dto.type : room.type,
      dto.specialtyId !== undefined ? dto.specialtyId : room.specialtyId,
      dto.floor !== undefined ? dto.floor : room.floor,
      dto.capacity !== undefined ? dto.capacity : room.capacity,
      room.isActive,
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
      resources: saved.resources ? saved.resources.map(r => ({
        id: r.id,
        roomId: r.roomId,
        name: r.name,
        code: r.code,
        type: r.type,
        isActive: r.isActive,
        isOccupied: r.isOccupied,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      })) : [],
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
