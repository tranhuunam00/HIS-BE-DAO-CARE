import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { Branch } from '../../domain/entities/branch.model';
import { BranchOrmEntity } from '../database/branch.entity';

@Injectable()
export class BranchRepository implements IBranchRepository {
  constructor(
    @InjectRepository(BranchOrmEntity)
    private readonly ormRepository: Repository<BranchOrmEntity>
  ) {}

  async findAll(): Promise<Branch[]> {
    const orms = await this.ormRepository.find({
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(id: string): Promise<Branch | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Branch | null> {
    const orm = await this.ormRepository.findOne({
      where: { code },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async save(branch: Branch): Promise<Branch> {
    const orm = this.toOrm(branch);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: BranchOrmEntity): Branch {
    return new Branch(
      orm.id,
      orm.organizationId,
      orm.name,
      orm.code,
      orm.type,
      orm.technicalDirector,
      orm.operatingLicense,
      orm.isActive,
      orm.hotline,
      orm.email,
      orm.country,
      orm.province,
      orm.district,
      orm.addressDetail,
      orm.googleMapUrl,
      orm.workingDays,
      orm.openTime,
      orm.closeTime,
      orm.bankName,
      orm.bankAccountNo,
      orm.bankAccountName,
      orm.createdAt,
      orm.updatedAt
    );
  }

  private toOrm(domain: Branch): BranchOrmEntity {
    const orm = new BranchOrmEntity();
    orm.id = domain.id;
    orm.organizationId = domain.organizationId;
    orm.name = domain.name;
    orm.code = domain.code;
    orm.type = domain.type;
    orm.technicalDirector = domain.technicalDirector;
    orm.operatingLicense = domain.operatingLicense;
    orm.isActive = domain.isActive;
    orm.hotline = domain.hotline;
    orm.email = domain.email;
    orm.country = domain.country;
    orm.province = domain.province;
    orm.district = domain.district;
    orm.addressDetail = domain.addressDetail;
    orm.googleMapUrl = domain.googleMapUrl;
    orm.workingDays = domain.workingDays;
    orm.openTime = domain.openTime;
    orm.closeTime = domain.closeTime;
    orm.bankName = domain.bankName;
    orm.bankAccountNo = domain.bankAccountNo;
    orm.bankAccountName = domain.bankAccountName;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
