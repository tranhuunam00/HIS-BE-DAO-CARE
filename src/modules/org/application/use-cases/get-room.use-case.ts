import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import type { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { RoomResponseDto } from '../dtos/room.dto';

@Injectable()
export class GetRoomUseCase {
  constructor(
    @Inject(IRoomRepositoryToken)
    private readonly roomRepository: IRoomRepository
  ) {}

  async execute(id: string): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID "${id}"`);
    }

    return {
      id: room.id,
      branchId: room.branchId,
      name: room.name,
      code: room.code,
      type: room.type,
      specialtyId: room.specialtyId,
      floor: room.floor,
      capacity: room.capacity,
      isActive: room.isActive,
      resources: room.resources ? room.resources.map(r => ({
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
      serviceIds: room.serviceIds || [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
