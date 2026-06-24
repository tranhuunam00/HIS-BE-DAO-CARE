import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IResourceRepositoryToken } from '../../domain/repositories/resource.repository.interface';
import type { IResourceRepository } from '../../domain/repositories/resource.repository.interface';
import { ResourceResponseDto } from '../dtos/resource.dto';
import { Resource } from '../../domain/entities/resource.model';

@Injectable()
export class ToggleResourceOccupancyUseCase {
  constructor(
    @Inject(IResourceRepositoryToken)
    private readonly resourceRepository: IResourceRepository
  ) {}

  async execute(id: string, isOccupied: boolean): Promise<ResourceResponseDto> {
    const resource = await this.resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundException(`Không tìm thấy tài nguyên với ID "${id}"`);
    }

    const updatedResource = new Resource(
      resource.id,
      resource.roomId,
      resource.name,
      resource.code,
      resource.type,
      resource.isActive,
      isOccupied,
      resource.createdAt,
      new Date()
    );

    const saved = await this.resourceRepository.save(updatedResource);
    return {
      id: saved.id,
      roomId: saved.roomId,
      name: saved.name,
      code: saved.code,
      type: saved.type,
      isActive: saved.isActive,
      isOccupied: saved.isOccupied,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
