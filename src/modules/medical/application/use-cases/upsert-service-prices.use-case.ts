import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

    // Get existing prices in DB
    const existingPrices = await this.servicePriceRepository.findByServiceId(serviceId);

    // Normalize date helper to compare only calendar days
    const getStartOfDayTime = (dateInput: Date | string) => {
      const d = new Date(dateInput);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const getFormattedDateString = (dateInput: Date | string) => {
      const d = new Date(dateInput);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStart = getStartOfDayTime(new Date());

    // Extract priceTypes present in the payload
    const priceTypesInPayload = Array.from(new Set(dto.prices.map((p) => p.priceType as string)));

    // Filter existing prices that are already active or expired AND have types present in the payload
    const oldPrices = existingPrices.filter((ep) => {
      return getStartOfDayTime(ep.effectiveDate) <= todayStart && priceTypesInPayload.includes(ep.priceType);
    });

    // Validate: future effective dates are not allowed
    for (const newPrice of dto.prices) {
      if (getStartOfDayTime(newPrice.effectiveDate) > todayStart) {
        throw new BadRequestException(
          `Không được phép cấu hình đơn giá có hiệu lực trong tương lai (Ngày hiệu lực: ${new Date(newPrice.effectiveDate).toLocaleDateString('vi-VN')})`
        );
      }
    }

    // Validate: active/expired prices cannot be deleted or modified
    for (const oldPrice of oldPrices) {
      const oldDateStr = getFormattedDateString(oldPrice.effectiveDate);

      // Match by priceType and effectiveDate
      const matchingNew = dto.prices.find((np) => {
        const npDateStr = getFormattedDateString(np.effectiveDate);
        return np.priceType === oldPrice.priceType && npDateStr === oldDateStr;
      });

      if (!matchingNew) {
        const payloadSummary = dto.prices.map(p => `[type:${p.priceType}, date:${getFormattedDateString(p.effectiveDate)}]`).join(', ');
        throw new BadRequestException(
          `Không được phép xóa đơn giá cũ đã hoặc đang áp dụng (Ngày hiệu lực DB: ${oldDateStr}, Loại: ${oldPrice.priceType}. Danh sách gửi lên: ${payloadSummary})`
        );
      }

      if (Number(matchingNew.amount) !== Number(oldPrice.amount)) {
        throw new BadRequestException(
          `Không được phép thay đổi số tiền của đơn giá cũ đã hoặc đang áp dụng (Ngày hiệu lực: ${oldDateStr})`
        );
      }

      if ((matchingNew.vatRate ?? 0) !== (oldPrice.vatRate ?? 0)) {
        throw new BadRequestException(
          `Không được phép thay đổi thuế VAT của đơn giá cũ đã hoặc đang áp dụng (Ngày hiệu lực: ${oldDateStr})`
        );
      }
    }

    // Only clear existing prices for the price types that are present in the payload!
    for (const priceType of priceTypesInPayload) {
      await this.servicePriceRepository.deleteByServiceAndType(serviceId, priceType);
    }

    for (const priceDto of dto.prices) {
      // Find matching existing price to preserve its ID and createdAt
      const existingMatch = existingPrices.find(
        (ep) =>
          ep.priceType === priceDto.priceType &&
          getFormattedDateString(ep.effectiveDate) === getFormattedDateString(priceDto.effectiveDate)
      );

      const priceId = existingMatch ? existingMatch.id : crypto.randomUUID();

      // Create new price entry
      const price = new ServicePrice(
        priceId,
        serviceId,
        priceDto.priceType,
        priceDto.amount,
        priceDto.vatRate ?? 0,
        new Date(priceDto.effectiveDate),
        existingMatch ? existingMatch.createdAt : now,
        now,
      );
      await this.servicePriceRepository.save(price);
    }

    // Fetch and return the complete list of prices for this service (including other price types that were not modified)
    const finalPrices = await this.servicePriceRepository.findByServiceId(serviceId);
    return finalPrices.map((saved) => ({
      id: saved.id,
      serviceId: saved.serviceId,
      priceType: saved.priceType,
      amount: saved.amount,
      vatRate: saved.vatRate,
      effectiveDate: saved.effectiveDate,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    }));
  }
}
