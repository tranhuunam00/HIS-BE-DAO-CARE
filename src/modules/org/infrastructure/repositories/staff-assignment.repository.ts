import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStaffAssignmentRepository } from '../../domain/repositories/staff-assignment.repository.interface';
import { StaffAssignment } from '../../domain/entities/staff-assignment.model';
import { StaffAssignmentOrmEntity } from '../database/staff-assignment.entity';

@Injectable()
export class StaffAssignmentRepository implements IStaffAssignmentRepository {
  constructor(
    @InjectRepository(StaffAssignmentOrmEntity)
    private readonly ormRepository: Repository<StaffAssignmentOrmEntity>
  ) {}

  async findByStaffId(staffId: string): Promise<StaffAssignment[]> {
    const orms = await this.ormRepository.find({
      where: { staffId },
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async save(assignment: StaffAssignment): Promise<StaffAssignment> {
    const orm = this.toOrm(assignment);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async clearPrimary(staffId: string): Promise<void> {
    await this.ormRepository.update({ staffId, isPrimary: true }, { isPrimary: false });
  }

  private toDomain(orm: StaffAssignmentOrmEntity): StaffAssignment {
    return new StaffAssignment(
      orm.id,
      orm.staffId,
      orm.branchId,
      orm.specialtyId,
      orm.roomId,
      orm.isPrimary,
      orm.createdAt,
      orm.updatedAt
    );
  }

  private toOrm(domain: StaffAssignment): StaffAssignmentOrmEntity {
    const orm = new StaffAssignmentOrmEntity();
    orm.id = domain.id;
    orm.staffId = domain.staffId;
    orm.branchId = domain.branchId;
    orm.specialtyId = domain.specialtyId;
    orm.roomId = domain.roomId;
    orm.isPrimary = domain.isPrimary;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
