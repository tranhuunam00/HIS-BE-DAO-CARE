import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepositoryToken } from '../../domain/repositories/service.repository.interface';
import type { IServiceRepository } from '../../domain/repositories/service.repository.interface';
import { ServiceResponseDto } from '../dtos/service.dto';

@Injectable()
export class GetServiceUseCase {
  constructor(
    @Inject(IServiceRepositoryToken)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(id: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID "${id}"`);
    }
    return {
      id: service.id,
      specialtyId: service.specialtyId,
      code: service.code,
      name: service.name,
      category: service.category,
      insuranceCode: service.insuranceCode,
      description: service.description,
      durationMinutes: service.durationMinutes,
      resultDurationHours: service.resultDurationHours,
      isActive: service.isActive,
      prices: (service.prices ?? []).map((p) => ({
        id: p.id,
        serviceId: p.serviceId,
        priceType: p.priceType,
        amount: p.amount,
        vatRate: p.vatRate,
        effectiveDate: p.effectiveDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
