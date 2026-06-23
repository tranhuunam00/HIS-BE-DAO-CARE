import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrganizationRepository } from '../../domain/repositories/organization.repository.interface';
import { Organization } from '../../domain/entities/organization.model';
import { OrganizationOrmEntity } from '../database/organization.entity';

@Injectable()
export class OrganizationRepository implements IOrganizationRepository {
  constructor(
    @InjectRepository(OrganizationOrmEntity)
    private readonly ormRepository: Repository<OrganizationOrmEntity>
  ) {}

  async findDefault(): Promise<Organization | null> {
    const orm = await this.ormRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findById(id: string): Promise<Organization | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Organization | null> {
    const orm = await this.ormRepository.findOne({
      where: { code },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async save(org: Organization): Promise<Organization> {
    const orm = this.toOrm(org);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: OrganizationOrmEntity): Organization {
    return new Organization(
      orm.id,
      orm.name,
      orm.shortName,
      orm.code,
      orm.logoUrl,
      orm.taxCode,
      orm.operatingLicense,
      orm.legalRepresentative,
      orm.hotline,
      orm.email,
      orm.website,
      orm.address,
      orm.language,
      orm.timezone,
      orm.country,
      orm.defaultCurrency,
      orm.dateFormat,
      orm.timeFormat,
      orm.currencyFormat,
      orm.otpExpirationTime,
      orm.appointmentCancellationLimit,
      orm.mrnFormat,
      orm.patientCodeFormat,
      orm.visitCodeFormat,
      orm.createdAt,
      orm.updatedAt
    );
  }

  private toOrm(domain: Organization): OrganizationOrmEntity {
    const orm = new OrganizationOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.shortName = domain.shortName;
    orm.code = domain.code;
    orm.logoUrl = domain.logoUrl;
    orm.taxCode = domain.taxCode;
    orm.operatingLicense = domain.operatingLicense;
    orm.legalRepresentative = domain.legalRepresentative;
    orm.hotline = domain.hotline;
    orm.email = domain.email;
    orm.website = domain.website;
    orm.address = domain.address;
    orm.language = domain.language;
    orm.timezone = domain.timezone;
    orm.country = domain.country;
    orm.defaultCurrency = domain.defaultCurrency;
    orm.dateFormat = domain.dateFormat;
    orm.timeFormat = domain.timeFormat;
    orm.currencyFormat = domain.currencyFormat;
    orm.otpExpirationTime = domain.otpExpirationTime;
    orm.appointmentCancellationLimit = domain.appointmentCancellationLimit;
    orm.mrnFormat = domain.mrnFormat;
    orm.patientCodeFormat = domain.patientCodeFormat;
    orm.visitCodeFormat = domain.visitCodeFormat;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
