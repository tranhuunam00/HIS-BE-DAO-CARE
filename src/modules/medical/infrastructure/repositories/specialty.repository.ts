import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISpecialtyRepository } from '../../domain/repositories/specialty.repository.interface';
import { Specialty } from '../../domain/entities/specialty.model';
import { SpecialtyOrmEntity } from '../database/specialty.entity';

@Injectable()
export class SpecialtyRepository implements ISpecialtyRepository {
  constructor(
    @InjectRepository(SpecialtyOrmEntity)
    private readonly ormRepository: Repository<SpecialtyOrmEntity>,
  ) {}

  async findAll(): Promise<Specialty[]> {
    const orms = await this.ormRepository.find({ order: { name: 'ASC' } });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: string): Promise<Specialty | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Specialty | null> {
    const orm = await this.ormRepository.findOne({ where: { code } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(specialty: Specialty): Promise<Specialty> {
    const orm = this.toOrm(specialty);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: SpecialtyOrmEntity): Specialty {
    return new Specialty(
      orm.id,
      orm.code,
      orm.name,
      orm.description,
      orm.iconUrl,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Specialty): SpecialtyOrmEntity {
    const orm = new SpecialtyOrmEntity();
    orm.id = domain.id;
    orm.code = domain.code;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.iconUrl = domain.iconUrl;
    orm.isActive = domain.isActive;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
