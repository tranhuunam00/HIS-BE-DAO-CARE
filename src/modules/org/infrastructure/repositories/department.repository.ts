import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDepartmentRepository } from '../../domain/repositories/department.repository.interface';
import { Department } from '../../domain/entities/department.model';
import { DepartmentOrmEntity } from '../database/department.entity';

@Injectable()
export class DepartmentRepository implements IDepartmentRepository {
  constructor(
    @InjectRepository(DepartmentOrmEntity)
    private readonly ormRepository: Repository<DepartmentOrmEntity>
  ) {}

  async findAll(branchId?: string): Promise<Department[]> {
    const where: any = {};
    if (branchId) {
      where.branchId = branchId;
    }
    const orms = await this.ormRepository.find({
      where,
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(id: string): Promise<Department | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Department | null> {
    const orm = await this.ormRepository.findOne({
      where: { code },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async save(department: Department): Promise<Department> {
    const orm = this.toOrm(department);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: DepartmentOrmEntity): Department {
    return new Department(
      orm.id,
      orm.branchId,
      orm.name,
      orm.code,
      orm.description,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt
    );
  }

  private toOrm(domain: Department): DepartmentOrmEntity {
    const orm = new DepartmentOrmEntity();
    orm.id = domain.id;
    orm.branchId = domain.branchId;
    orm.name = domain.name;
    orm.code = domain.code;
    orm.description = domain.description;
    orm.isActive = domain.isActive;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
