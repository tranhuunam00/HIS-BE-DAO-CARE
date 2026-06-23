import { Inject, Injectable } from '@nestjs/common';
import { ISpecialtyRepositoryToken } from '../../domain/repositories/specialty.repository.interface';
import type { ISpecialtyRepository } from '../../domain/repositories/specialty.repository.interface';
import { SpecialtyResponseDto } from '../dtos/specialty.dto';

@Injectable()
export class ListSpecialtiesUseCase {
  constructor(
    @Inject(ISpecialtyRepositoryToken)
    private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async execute(): Promise<SpecialtyResponseDto[]> {
    const specialties = await this.specialtyRepository.findAll();
    return specialties.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description,
      iconUrl: s.iconUrl,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }
}
