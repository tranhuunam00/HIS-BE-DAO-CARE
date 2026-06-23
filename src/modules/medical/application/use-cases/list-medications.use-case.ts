import { Inject, Injectable } from '@nestjs/common';
import { IMedicationRepositoryToken } from '../../domain/repositories/medication.repository.interface';
import type { IMedicationRepository } from '../../domain/repositories/medication.repository.interface';
import { MedicationResponseDto } from '../dtos/medication.dto';

@Injectable()
export class ListMedicationsUseCase {
  constructor(
    @Inject(IMedicationRepositoryToken)
    private readonly medicationRepository: IMedicationRepository,
  ) {}

  async execute(search?: string): Promise<MedicationResponseDto[]> {
    const meds = await this.medicationRepository.findAll(search);
    return meds.map((m) => ({
      id: m.id,
      code: m.code,
      nationalCode: m.nationalCode,
      name: m.name,
      activeIngredient: m.activeIngredient,
      concentration: m.concentration,
      unit: m.unit,
      usageUnit: m.usageUnit,
      routeOfAdministration: m.routeOfAdministration,
      maxDosePerDay: m.maxDosePerDay,
      groupName: m.groupName,
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }
}
