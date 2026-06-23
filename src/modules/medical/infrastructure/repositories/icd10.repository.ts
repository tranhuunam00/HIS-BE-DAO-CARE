import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { IIcd10Repository } from '../../domain/repositories/icd10.repository.interface';
import { Icd10 } from '../../domain/entities/icd10.model';
import { Icd10OrmEntity } from '../database/icd10.entity';

@Injectable()
export class Icd10Repository implements IIcd10Repository {
  constructor(
    @InjectRepository(Icd10OrmEntity)
    private readonly ormRepository: Repository<Icd10OrmEntity>,
  ) {}

  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Icd10[]; total: number }> {
    const where: any = search
      ? [{ code: ILike(`%${search}%`) }, { name: ILike(`%${search}%`) }]
      : {};

    const [orms, total] = await this.ormRepository.findAndCount({
      where,
      order: { code: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: orms.map((o) => this.toDomain(o)), total };
  }

  async findById(id: string): Promise<Icd10 | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Icd10 | null> {
    const orm = await this.ormRepository.findOne({ where: { code } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(icd10: Icd10): Promise<Icd10> {
    const orm = this.toOrm(icd10);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: Icd10OrmEntity): Icd10 {
    return new Icd10(
      orm.id,
      orm.code,
      orm.name,
      orm.nameEn,
      orm.specialtyId,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Icd10): Icd10OrmEntity {
    const orm = new Icd10OrmEntity();
    orm.id = domain.id;
    orm.code = domain.code;
    orm.name = domain.name;
    orm.nameEn = domain.nameEn;
    orm.specialtyId = domain.specialtyId;
    orm.isActive = domain.isActive;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
