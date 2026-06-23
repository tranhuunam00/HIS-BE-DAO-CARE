import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISpecialtyRepositoryToken } from '../../domain/repositories/specialty.repository.interface';
import type { ISpecialtyRepository } from '../../domain/repositories/specialty.repository.interface';
import { SpecialtyResponseDto } from '../dtos/specialty.dto';
import { Specialty } from '../../domain/entities/specialty.model';

@Injectable()
export class ToggleSpecialtyStatusUseCase {
  constructor(
    @Inject(ISpecialtyRepositoryToken)
    private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async execute(id: string): Promise<SpecialtyResponseDto> {
    const existing = await this.specialtyRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy chuyên khoa với ID "${id}"`);
    }

    const toggled = new Specialty(
      existing.id,
      existing.code,
      existing.name,
      existing.description,
      existing.iconUrl,
      !existing.isActive,
      existing.createdAt,
      new Date(),
    );

    const saved = await this.specialtyRepository.save(toggled);
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
