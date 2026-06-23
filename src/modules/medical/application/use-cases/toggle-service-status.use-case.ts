import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepositoryToken } from '../../domain/repositories/service.repository.interface';
import type { IServiceRepository } from '../../domain/repositories/service.repository.interface';
import { ServiceResponseDto } from '../dtos/service.dto';
import { Service } from '../../domain/entities/service.model';

@Injectable()
export class ToggleServiceStatusUseCase {
  constructor(
    @Inject(IServiceRepositoryToken)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(id: string): Promise<ServiceResponseDto> {
    const existing = await this.serviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID "${id}"`);
    }

    const toggled = new Service(
      existing.id,
      existing.specialtyId,
      existing.code,
      existing.name,
      existing.category,
      existing.insuranceCode,
      existing.description,
      existing.durationMinutes,
      existing.resultDurationHours,
      !existing.isActive,
      existing.createdAt,
      new Date(),
      existing.prices,
    );

    const saved = await this.serviceRepository.save(toggled);
    return {
      id: saved.id,
      specialtyId: saved.specialtyId,
      code: saved.code,
      name: saved.name,
      category: saved.category,
      insuranceCode: saved.insuranceCode,
      description: saved.description,
      durationMinutes: saved.durationMinutes,
      resultDurationHours: saved.resultDurationHours,
      isActive: saved.isActive,
      prices: (saved.prices ?? []).map((p) => ({
        id: p.id,
        serviceId: p.serviceId,
        priceType: p.priceType,
        amount: p.amount,
        vatRate: p.vatRate,
        effectiveDate: p.effectiveDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
