import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepositoryToken } from '../../domain/repositories/service.repository.interface';
import type { IServiceRepository } from '../../domain/repositories/service.repository.interface';
import { IServicePriceRepositoryToken } from '../../domain/repositories/service-price.repository.interface';
import type { IServicePriceRepository } from '../../domain/repositories/service-price.repository.interface';
import { UpsertServicePriceDto, ServicePriceResponseDto } from '../dtos/service.dto';
import { ServicePrice } from '../../domain/entities/service-price.model';
import * as crypto from 'crypto';

@Injectable()
export class UpsertServicePricesUseCase {
  constructor(
    @Inject(IServiceRepositoryToken)
    private readonly serviceRepository: IServiceRepository,
    @Inject(IServicePriceRepositoryToken)
    private readonly servicePriceRepository: IServicePriceRepository,
  ) {}

  async execute(serviceId: string, dto: UpsertServicePriceDto): Promise<ServicePriceResponseDto[]> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID "${serviceId}"`);
    }

    const now = new Date();
    const result: ServicePriceResponseDto[] = [];

    for (const priceDto of dto.prices) {
      // Delete existing price of same type
      await this.servicePriceRepository.deleteByServiceAndType(serviceId, priceDto.priceType);

      // Create new price entry
      const price = new ServicePrice(
        crypto.randomUUID(),
        serviceId,
        priceDto.priceType,
        priceDto.amount,
        priceDto.vatRate ?? 0,
        new Date(priceDto.effectiveDate),
        now,
        now,
      );
      const saved = await this.servicePriceRepository.save(price);
      result.push({
        id: saved.id,
        serviceId: saved.serviceId,
        priceType: saved.priceType,
        amount: saved.amount,
        vatRate: saved.vatRate,
        effectiveDate: saved.effectiveDate,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      });
    }

    return result;
  }
}
