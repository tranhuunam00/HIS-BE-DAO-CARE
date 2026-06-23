import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IServiceRepository } from '../../domain/repositories/service.repository.interface';
import { Service } from '../../domain/entities/service.model';
import { ServicePrice } from '../../domain/entities/service-price.model';
import { ServiceOrmEntity } from '../database/service.entity';

@Injectable()
export class ServiceRepository implements IServiceRepository {
  constructor(
    @InjectRepository(ServiceOrmEntity)
    private readonly ormRepository: Repository<ServiceOrmEntity>,
  ) {}

  async findAll(specialtyId?: string, category?: string): Promise<Service[]> {
    const where: any = {};
    if (specialtyId) where.specialtyId = specialtyId;
    if (category) where.category = category;
    const orms = await this.ormRepository.find({
      where,
      relations: { prices: true },
      order: { name: 'ASC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: string): Promise<Service | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      relations: { prices: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Service | null> {
    const orm = await this.ormRepository.findOne({ where: { code } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(service: Service): Promise<Service> {
    const orm = this.toOrm(service);
    const saved = await this.ormRepository.save(orm);
    // Reload with relations
    const reloaded = await this.ormRepository.findOne({
      where: { id: saved.id },
      relations: { prices: true },
    });
    return this.toDomain(reloaded!);
  }

  private toDomain(orm: ServiceOrmEntity): Service {
    const prices: ServicePrice[] = orm.prices
      ? orm.prices.map(
          (p) =>
            new ServicePrice(
              p.id,
              p.serviceId,
              p.priceType,
              Number(p.amount),
              Number(p.vatRate),
              p.effectiveDate,
              p.createdAt,
              p.updatedAt,
            ),
        )
      : [];

    return new Service(
      orm.id,
      orm.specialtyId,
      orm.code,
      orm.name,
      orm.category,
      orm.insuranceCode,
      orm.description,
      orm.durationMinutes,
      orm.resultDurationHours,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
      prices,
    );
  }

  private toOrm(domain: Service): ServiceOrmEntity {
    const orm = new ServiceOrmEntity();
    orm.id = domain.id;
    orm.specialtyId = domain.specialtyId;
    orm.code = domain.code;
    orm.name = domain.name;
    orm.category = domain.category;
    orm.insuranceCode = domain.insuranceCode;
    orm.description = domain.description;
    orm.durationMinutes = domain.durationMinutes;
    orm.resultDurationHours = domain.resultDurationHours;
    orm.isActive = domain.isActive;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
