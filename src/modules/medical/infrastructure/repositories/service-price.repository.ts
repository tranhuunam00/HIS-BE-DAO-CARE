import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IServicePriceRepository } from '../../domain/repositories/service-price.repository.interface';
import { ServicePrice } from '../../domain/entities/service-price.model';
import { ServicePriceOrmEntity } from '../database/service-price.entity';

@Injectable()
export class ServicePriceRepository implements IServicePriceRepository {
  constructor(
    @InjectRepository(ServicePriceOrmEntity)
    private readonly ormRepository: Repository<ServicePriceOrmEntity>,
  ) {}

  async findByServiceId(serviceId: string): Promise<ServicePrice[]> {
    const orms = await this.ormRepository.find({ where: { serviceId } });
    return orms.map((o) => this.toDomain(o));
  }

  async findByServiceAndType(serviceId: string, priceType: string): Promise<ServicePrice | null> {
    const orm = await this.ormRepository.findOne({ where: { serviceId, priceType } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(price: ServicePrice): Promise<ServicePrice> {
    const orm = this.toOrm(price);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async deleteByServiceAndType(serviceId: string, priceType: string): Promise<void> {
    await this.ormRepository.delete({ serviceId, priceType });
  }

  private toDomain(orm: ServicePriceOrmEntity): ServicePrice {
    return new ServicePrice(
      orm.id,
      orm.serviceId,
      orm.priceType,
      Number(orm.amount),
      Number(orm.vatRate),
      orm.effectiveDate,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: ServicePrice): ServicePriceOrmEntity {
    const orm = new ServicePriceOrmEntity();
    orm.id = domain.id;
    orm.serviceId = domain.serviceId;
    orm.priceType = domain.priceType;
    orm.amount = domain.amount;
    orm.vatRate = domain.vatRate;
    orm.effectiveDate = domain.effectiveDate;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
