import { Inject, Injectable } from '@nestjs/common';
import { IResourceRepositoryToken } from '../../domain/repositories/resource.repository.interface';
import type { IResourceRepository } from '../../domain/repositories/resource.repository.interface';
import { ResourceResponseDto } from '../dtos/resource.dto';

@Injectable()
export class ListResourcesUseCase {
  constructor(
    @Inject(IResourceRepositoryToken)
    private readonly resourceRepository: IResourceRepository
  ) {}

  async execute(roomId?: string): Promise<ResourceResponseDto[]> {
    const resources = await this.resourceRepository.findAll(roomId);
    return resources.map((r) => ({
      id: r.id,
      roomId: r.roomId,
      name: r.name,
      code: r.code,
      type: r.type,
      isActive: r.isActive,
      isOccupied: r.isOccupied,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }
}
