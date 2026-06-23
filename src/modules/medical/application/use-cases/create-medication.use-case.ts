import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IMedicationRepositoryToken } from '../../domain/repositories/medication.repository.interface';
import type { IMedicationRepository } from '../../domain/repositories/medication.repository.interface';
import { CreateMedicationDto, MedicationResponseDto } from '../dtos/medication.dto';
import { Medication } from '../../domain/entities/medication.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateMedicationUseCase {
  constructor(
    @Inject(IMedicationRepositoryToken)
    private readonly medicationRepository: IMedicationRepository,
  ) {}

  async execute(dto: CreateMedicationDto): Promise<MedicationResponseDto> {
    const existing = await this.medicationRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Mã thuốc "${dto.code}" đã tồn tại.`);
    }

    if (dto.nationalCode) {
      const existingNational = await this.medicationRepository.findByNationalCode(dto.nationalCode);
      if (existingNational) {
        throw new ConflictException(`Mã liên thông quốc gia "${dto.nationalCode}" đã được sử dụng.`);
      }
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const med = new Medication(
      id,
      dto.code,
      dto.nationalCode ?? null,
      dto.name,
      dto.activeIngredient,
      dto.concentration,
      dto.unit,
      dto.usageUnit ?? null,
      dto.routeOfAdministration,
      dto.maxDosePerDay ?? null,
      dto.groupName ?? null,
      true,
      now,
      now,
    );

    const saved = await this.medicationRepository.save(med);
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
