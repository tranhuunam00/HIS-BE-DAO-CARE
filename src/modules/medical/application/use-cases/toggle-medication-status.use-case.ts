import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMedicationRepositoryToken } from '../../domain/repositories/medication.repository.interface';
import type { IMedicationRepository } from '../../domain/repositories/medication.repository.interface';
import { MedicationResponseDto } from '../dtos/medication.dto';
import { Medication } from '../../domain/entities/medication.model';

@Injectable()
export class ToggleMedicationStatusUseCase {
  constructor(
    @Inject(IMedicationRepositoryToken)
    private readonly medicationRepository: IMedicationRepository,
  ) {}

  async execute(id: string): Promise<MedicationResponseDto> {
    const existing = await this.medicationRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy thuốc với ID "${id}"`);
    }

    const toggled = new Medication(
      existing.id,
      existing.code,
      existing.nationalCode,
      existing.name,
      existing.activeIngredient,
      existing.concentration,
      existing.unit,
      existing.usageUnit,
      existing.routeOfAdministration,
      existing.maxDosePerDay,
      existing.groupName,
      !existing.isActive,
      existing.createdAt,
      new Date(),
    );

    const saved = await this.medicationRepository.save(toggled);
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
