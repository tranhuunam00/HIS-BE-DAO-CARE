import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISpecialtyRepositoryToken } from '../../domain/repositories/specialty.repository.interface';
import type { ISpecialtyRepository } from '../../domain/repositories/specialty.repository.interface';
import { UpdateSpecialtyDto, SpecialtyResponseDto } from '../dtos/specialty.dto';
import { Specialty } from '../../domain/entities/specialty.model';

@Injectable()
export class UpdateSpecialtyUseCase {
  constructor(
    @Inject(ISpecialtyRepositoryToken)
    private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async execute(id: string, dto: UpdateSpecialtyDto): Promise<SpecialtyResponseDto> {
    const existing = await this.specialtyRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy chuyên khoa với ID "${id}"`);
    }

    const updated = new Specialty(
      existing.id,
      existing.code,
      dto.name ?? existing.name,
      dto.description !== undefined ? dto.description : existing.description,
      dto.iconUrl !== undefined ? dto.iconUrl : existing.iconUrl,
      existing.isActive,
      existing.createdAt,
      new Date(),
    );

    const saved = await this.specialtyRepository.save(updated);
    return {
      id: saved.id,
      code: saved.code,
      name: saved.name,
      description: saved.description,
      iconUrl: saved.iconUrl,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
