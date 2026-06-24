import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IShiftRepository } from '../../domain/repositories/shift.repository.interface';
import { Shift } from '../../domain/entities/shift.model';
import { ShiftOrmEntity } from '../database/shift.entity';

@Injectable()
export class ShiftRepository implements IShiftRepository {
  constructor(
    @InjectRepository(ShiftOrmEntity)
    private readonly ormRepository: Repository<ShiftOrmEntity>,
  ) {}

  async findAll(): Promise<Shift[]> {
    const orms = await this.ormRepository.find({ order: { startTime: 'ASC' } });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: string): Promise<Shift | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(shift: Shift): Promise<Shift> {
    const orm = this.toOrm(shift);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: ShiftOrmEntity): Shift {
    return new Shift(
      orm.id,
      orm.name,
      orm.startTime,
      orm.endTime,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Shift): ShiftOrmEntity {
    const orm = new ShiftOrmEntity();
    if (domain.id) orm.id = domain.id;
    orm.name = domain.name;
    orm.startTime = domain.startTime;
    orm.endTime = domain.endTime;
    orm.isActive = domain.isActive;
    return orm;
  }
}
