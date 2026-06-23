import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISpecialtyRepositoryToken } from '../../domain/repositories/specialty.repository.interface';
import type { ISpecialtyRepository } from '../../domain/repositories/specialty.repository.interface';
import { SpecialtyResponseDto } from '../dtos/specialty.dto';

@Injectable()
export class GetSpecialtyUseCase {
  constructor(
    @Inject(ISpecialtyRepositoryToken)
    private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async execute(id: string): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtyRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(`Không tìm thấy chuyên khoa với ID "${id}"`);
    }
    return {
      id: specialty.id,
      code: specialty.code,
      name: specialty.name,
      description: specialty.description,
      iconUrl: specialty.iconUrl,
      isActive: specialty.isActive,
      createdAt: specialty.createdAt,
      updatedAt: specialty.updatedAt,
    };
  }
}
