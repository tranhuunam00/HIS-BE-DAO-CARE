import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import type { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { CreateRoomDto, RoomResponseDto } from '../dtos/room.dto';
import { Room } from '../../domain/entities/room.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(IRoomRepositoryToken)
    private readonly roomRepository: IRoomRepository,
    @Inject(IBranchRepositoryToken)
    private readonly branchRepository: IBranchRepository
  ) {}

  async execute(dto: CreateRoomDto): Promise<RoomResponseDto> {
    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với ID "${dto.branchId}"`);
    }

    const existingCode = await this.roomRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException(`Mã phòng "${dto.code}" đã được sử dụng.`);
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const room = new Room(
      id,
      dto.branchId,
      dto.name,
      dto.code,
      dto.type,
      dto.specialtyId || null,
      dto.floor || null,
      dto.capacity || 1,
      true,
      now,
      now,
      []
    );

    const saved = await this.roomRepository.save(room);
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
      resources: [],
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
