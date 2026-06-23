import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { IMedicationRepository } from '../../domain/repositories/medication.repository.interface';
import { Medication } from '../../domain/entities/medication.model';
import { MedicationOrmEntity } from '../database/medication.entity';

@Injectable()
export class MedicationRepository implements IMedicationRepository {
  constructor(
    @InjectRepository(MedicationOrmEntity)
    private readonly ormRepository: Repository<MedicationOrmEntity>,
  ) {}

  async findAll(search?: string): Promise<Medication[]> {
    const where: any = search
      ? [
          { name: ILike(`%${search}%`) },
          { activeIngredient: ILike(`%${search}%`) },
          { code: ILike(`%${search}%`) },
        ]
      : {};
    const orms = await this.ormRepository.find({ where, order: { name: 'ASC' } });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: string): Promise<Medication | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Medication | null> {
    const orm = await this.ormRepository.findOne({ where: { code } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByNationalCode(nationalCode: string): Promise<Medication | null> {
    const orm = await this.ormRepository.findOne({ where: { nationalCode } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(medication: Medication): Promise<Medication> {
    const orm = this.toOrm(medication);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: MedicationOrmEntity): Medication {
    return new Medication(
      orm.id,
      orm.code,
      orm.nationalCode,
      orm.name,
      orm.activeIngredient,
      orm.concentration,
      orm.unit,
      orm.usageUnit,
      orm.routeOfAdministration,
      orm.maxDosePerDay,
      orm.groupName,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Medication): MedicationOrmEntity {
    const orm = new MedicationOrmEntity();
    orm.id = domain.id;
    orm.code = domain.code;
    orm.nationalCode = domain.nationalCode;
    orm.name = domain.name;
    orm.activeIngredient = domain.activeIngredient;
    orm.concentration = domain.concentration;
    orm.unit = domain.unit;
    orm.usageUnit = domain.usageUnit;
    orm.routeOfAdministration = domain.routeOfAdministration;
    orm.maxDosePerDay = domain.maxDosePerDay;
    orm.groupName = domain.groupName;
    orm.isActive = domain.isActive;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
