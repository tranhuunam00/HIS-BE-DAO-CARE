import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IIcd10RepositoryToken } from '../../domain/repositories/icd10.repository.interface';
import type { IIcd10Repository } from '../../domain/repositories/icd10.repository.interface';
import { UpdateIcd10Dto, Icd10ResponseDto } from '../dtos/icd10.dto';
import { Icd10 } from '../../domain/entities/icd10.model';

@Injectable()
export class UpdateIcd10UseCase {
  constructor(
    @Inject(IIcd10RepositoryToken)
    private readonly icd10Repository: IIcd10Repository,
  ) {}

  async execute(id: string, dto: UpdateIcd10Dto): Promise<Icd10ResponseDto> {
    const existing = await this.icd10Repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy mã ICD-10 với ID "${id}"`);
    }

    const updated = new Icd10(
      existing.id,
      existing.code,
      dto.name ?? existing.name,
      dto.nameEn !== undefined ? dto.nameEn ?? null : existing.nameEn,
      dto.specialtyId !== undefined ? dto.specialtyId ?? null : existing.specialtyId,
      existing.isActive,
      existing.createdAt,
      new Date(),
    );

    const saved = await this.icd10Repository.save(updated);
    return {
      id: saved.id,
      code: saved.code,
      name: saved.name,
      nameEn: saved.nameEn,
      specialtyId: saved.specialtyId,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
