import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMedicationRepositoryToken } from '../../domain/repositories/medication.repository.interface';
import type { IMedicationRepository } from '../../domain/repositories/medication.repository.interface';
import { MedicationResponseDto } from '../dtos/medication.dto';

@Injectable()
export class GetMedicationUseCase {
  constructor(
    @Inject(IMedicationRepositoryToken)
    private readonly medicationRepository: IMedicationRepository,
  ) {}

  async execute(id: string): Promise<MedicationResponseDto> {
    const med = await this.medicationRepository.findById(id);
    if (!med) {
      throw new NotFoundException(`Không tìm thấy thuốc với ID "${id}"`);
    }
    return {
      id: med.id,
      code: med.code,
      nationalCode: med.nationalCode,
      name: med.name,
      activeIngredient: med.activeIngredient,
      concentration: med.concentration,
      unit: med.unit,
      usageUnit: med.usageUnit,
      routeOfAdministration: med.routeOfAdministration,
      maxDosePerDay: med.maxDosePerDay,
      groupName: med.groupName,
      isActive: med.isActive,
      createdAt: med.createdAt,
      updatedAt: med.updatedAt,
    };
  }
}
