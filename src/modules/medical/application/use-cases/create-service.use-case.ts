import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IServiceRepositoryToken } from '../../domain/repositories/service.repository.interface';
import type { IServiceRepository } from '../../domain/repositories/service.repository.interface';
import { IServicePriceRepositoryToken } from '../../domain/repositories/service-price.repository.interface';
import type { IServicePriceRepository } from '../../domain/repositories/service-price.repository.interface';
import { CreateServiceDto, ServiceResponseDto } from '../dtos/service.dto';
import { Service } from '../../domain/entities/service.model';
import { ServicePrice } from '../../domain/entities/service-price.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(IServiceRepositoryToken)
    private readonly serviceRepository: IServiceRepository,
    @Inject(IServicePriceRepositoryToken)
    private readonly servicePriceRepository: IServicePriceRepository,
  ) {}

  async execute(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    const existing = await this.serviceRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Mã dịch vụ "${dto.code}" đã tồn tại.`);
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const service = new Service(
      id,
      dto.specialtyId ?? null,
      dto.code,
      dto.name,
      dto.category,
      dto.insuranceCode ?? null,
      dto.description ?? null,
      dto.durationMinutes ?? 30,
      dto.resultDurationHours ?? null,
      true,
      now,
      now,
      [],
    );

    const saved = await this.serviceRepository.save(service);

    // Save initial prices if provided
    const savedPrices: ServicePrice[] = [];
    if (dto.prices && dto.prices.length > 0) {
      for (const priceDto of dto.prices) {
        const price = new ServicePrice(
          crypto.randomUUID(),
          saved.id,
          priceDto.priceType,
          priceDto.amount,
          priceDto.vatRate ?? 0,
          new Date(priceDto.effectiveDate),
          now,
          now,
        );
        const savedPrice = await this.servicePriceRepository.save(price);
        savedPrices.push(savedPrice);
      }
    }

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
      prices: savedPrices.map((p) => ({
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
