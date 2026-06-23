import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IResourceRepositoryToken } from '../../domain/repositories/resource.repository.interface';
import type { IResourceRepository } from '../../domain/repositories/resource.repository.interface';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import type { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { CreateResourceDto, ResourceResponseDto } from '../dtos/resource.dto';
import { Resource } from '../../domain/entities/resource.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateResourceUseCase {
  constructor(
    @Inject(IResourceRepositoryToken)
    private readonly resourceRepository: IResourceRepository,
    @Inject(IRoomRepositoryToken)
    private readonly roomRepository: IRoomRepository
  ) {}

  async execute(dto: CreateResourceDto): Promise<ResourceResponseDto> {
    const room = await this.roomRepository.findById(dto.roomId);
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID "${dto.roomId}"`);
    }

    const existingCode = await this.resourceRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException(`Mã tài nguyên "${dto.code}" đã được sử dụng.`);
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const resource = new Resource(
      id,
      dto.roomId,
      dto.name,
      dto.code,
      dto.type,
      true,
      now,
      now
    );

    const saved = await this.resourceRepository.save(resource);
    return {
      id: saved.id,
      roomId: saved.roomId,
      name: saved.name,
      code: saved.code,
      type: saved.type,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
