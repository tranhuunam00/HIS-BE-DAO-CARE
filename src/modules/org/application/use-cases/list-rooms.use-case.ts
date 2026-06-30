import { Inject, Injectable } from '@nestjs/common';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import type { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { RoomResponseDto } from '../dtos/room.dto';

@Injectable()
export class ListRoomsUseCase {
  constructor(
    @Inject(IRoomRepositoryToken)
    private readonly roomRepository: IRoomRepository
  ) {}

  async execute(branchId?: string): Promise<RoomResponseDto[]> {
    const rooms = await this.roomRepository.findAll(branchId);
    return rooms.map((room) => ({
      id: room.id,
      branchId: room.branchId,
      name: room.name,
      code: room.code,
      type: room.type,
      specialtyId: room.specialtyId,
      floor: room.floor,
      isActive: room.isActive,
      serviceIds: room.serviceIds || [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));
  }
}
