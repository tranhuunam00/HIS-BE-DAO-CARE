import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IPatientRepository } from '../../domain/repositories/patient.repository.interface';
import { Patient } from '../../domain/entities/patient.model';
import { PatientOrmEntity } from '../database/patient.entity';

@Injectable()
export class PatientRepository implements IPatientRepository {
  constructor(
    @InjectRepository(PatientOrmEntity)
    private readonly ormRepository: Repository<PatientOrmEntity>,
  ) {}

  private mapToDomain(entity: PatientOrmEntity): Patient {
    return new Patient(
      entity.id,
      entity.patientCode,
      entity.fullName,
      entity.dob,
      entity.gender,
      entity.phone,
      entity.email,
      entity.address,
      entity.cccd,
      entity.guardianName,
      entity.guardianPhone,
      entity.guardianRelation,
      entity.avatarUrl,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async findAll(search?: string): Promise<Patient[]> {
    let whereClause = {};
    if (search) {
      whereClause = [
        { fullName: Like(`%${search}%`) },
        { phone: Like(`%${search}%`) },
        { patientCode: Like(`%${search}%`) },
        { cccd: Like(`%${search}%`) },
      ];
    }
    const entities = await this.ormRepository.find({
      where: whereClause,
      order: { fullName: 'ASC' },
    });
    return entities.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Patient | null> {
    const entity = await this.ormRepository.findOneBy({ id });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByPhone(phone: string): Promise<Patient | null> {
    const entity = await this.ormRepository.findOneBy({ phone });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Patient | null> {
    const entity = await this.ormRepository.findOneBy({ patientCode: code });
    return entity ? this.mapToDomain(entity) : null;
  }

  async save(patient: Omit<Patient, 'id'> & { id?: string }): Promise<Patient> {
    const entity = this.ormRepository.create(patient);
    const saved = await this.ormRepository.save(entity);
    return this.mapToDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async countAll(): Promise<number> {
    return await this.ormRepository.count();
  }
}
