import { Inject, Injectable } from '@nestjs/common';
import { IServiceRepositoryToken } from '../../domain/repositories/service.repository.interface';
import type { IServiceRepository } from '../../domain/repositories/service.repository.interface';
import { ServiceResponseDto } from '../dtos/service.dto';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(IServiceRepositoryToken)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(specialtyId?: string, category?: string): Promise<ServiceResponseDto[]> {
    const services = await this.serviceRepository.findAll(specialtyId, category);
    return services.map((s) => ({
      id: s.id,
      specialtyId: s.specialtyId,
      code: s.code,
      name: s.name,
      category: s.category,
      insuranceCode: s.insuranceCode,
      description: s.description,
      durationMinutes: s.durationMinutes,
      resultDurationHours: s.resultDurationHours,
      isActive: s.isActive,
      prices: (s.prices ?? []).map((p) => ({
        id: p.id,
        serviceId: p.serviceId,
        priceType: p.priceType,
        amount: p.amount,
        vatRate: p.vatRate,
        effectiveDate: p.effectiveDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }
}
