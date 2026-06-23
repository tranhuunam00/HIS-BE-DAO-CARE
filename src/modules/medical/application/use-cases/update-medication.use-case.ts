import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMedicationRepositoryToken } from '../../domain/repositories/medication.repository.interface';
import type { IMedicationRepository } from '../../domain/repositories/medication.repository.interface';
import { UpdateMedicationDto, MedicationResponseDto } from '../dtos/medication.dto';
import { Medication } from '../../domain/entities/medication.model';

@Injectable()
export class UpdateMedicationUseCase {
  constructor(
    @Inject(IMedicationRepositoryToken)
    private readonly medicationRepository: IMedicationRepository,
  ) {}

  async execute(id: string, dto: UpdateMedicationDto): Promise<MedicationResponseDto> {
    const existing = await this.medicationRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy thuốc với ID "${id}"`);
    }

    const updated = new Medication(
      existing.id,
      existing.code,
      dto.nationalCode !== undefined ? dto.nationalCode ?? null : existing.nationalCode,
      dto.name ?? existing.name,
      dto.activeIngredient ?? existing.activeIngredient,
      dto.concentration ?? existing.concentration,
      dto.unit ?? existing.unit,
      dto.usageUnit !== undefined ? dto.usageUnit ?? null : existing.usageUnit,
      dto.routeOfAdministration ?? existing.routeOfAdministration,
      dto.maxDosePerDay !== undefined ? dto.maxDosePerDay ?? null : existing.maxDosePerDay,
      dto.groupName !== undefined ? dto.groupName ?? null : existing.groupName,
      existing.isActive,
      existing.createdAt,
      new Date(),
    );

    const saved = await this.medicationRepository.save(updated);
    return {
      id: saved.id,
      code: saved.code,
      nationalCode: saved.nationalCode,
      name: saved.name,
      activeIngredient: saved.activeIngredient,
      concentration: saved.concentration,
      unit: saved.unit,
      usageUnit: saved.usageUnit,
      routeOfAdministration: saved.routeOfAdministration,
      maxDosePerDay: saved.maxDosePerDay,
      groupName: saved.groupName,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
