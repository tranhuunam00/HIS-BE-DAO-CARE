import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IResourceRepositoryToken } from '../../domain/repositories/resource.repository.interface';
import type { IResourceRepository } from '../../domain/repositories/resource.repository.interface';
import { UpdateResourceDto, ResourceResponseDto } from '../dtos/resource.dto';
import { Resource } from '../../domain/entities/resource.model';

@Injectable()
export class UpdateResourceUseCase {
  constructor(
    @Inject(IResourceRepositoryToken)
    private readonly resourceRepository: IResourceRepository
  ) {}

  async execute(id: string, dto: UpdateResourceDto): Promise<ResourceResponseDto> {
    const resource = await this.resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundException(`Không tìm thấy tài nguyên với ID "${id}"`);
    }

    const updatedResource = new Resource(
      resource.id,
      resource.roomId,
      dto.name !== undefined ? dto.name : resource.name,
      resource.code,
      dto.type !== undefined ? dto.type : resource.type,
      resource.isActive,
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
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
