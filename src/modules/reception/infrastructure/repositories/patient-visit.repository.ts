import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPatientVisitRepository } from '../../domain/repositories/patient-visit.repository.interface';
import { PatientVisit } from '../../domain/entities/patient-visit.model';
import { PatientVisitOrmEntity } from '../database/patient-visit.entity';
import { OrderOrmEntity } from '../../../billing/infrastructure/database/order.entity';
import { OrderItemOrmEntity } from '../../../billing/infrastructure/database/order-item.entity';

@Injectable()
export class PatientVisitRepository implements IPatientVisitRepository {
  constructor(
    @InjectRepository(PatientVisitOrmEntity)
    private readonly ormRepository: Repository<PatientVisitOrmEntity>,
  ) {}

  private mapToDomain(entity: PatientVisitOrmEntity): PatientVisit {
    return new PatientVisit(
      entity.id,
      entity.visitCode,
      entity.patientId,
      entity.branchId,
      entity.appointmentId,
      entity.currentRoomId,
      entity.currentDoctorId,
      entity.currentNurseId,
      entity.queueNumber,
      entity.priorityLevel,
      entity.queueCode,
      entity.status,
      entity.reason,
      entity.pulse,
      entity.bloodPressure,
      entity.temperature ? parseFloat(entity.temperature as any) : null,
      entity.weight ? parseFloat(entity.weight as any) : null,
      entity.height ? parseFloat(entity.height as any) : null,
      entity.createdAt,
      entity.updatedAt,
      entity.patient,
      entity.branch,
      entity.currentRoom,
      entity.currentDoctor,
      entity.currentNurse,
    );
  }

  async findAll(filters: {
    branchId?: string;
    roomId?: string;
    status?: string;
    date?: string;
    doctorId?: string;
    serviceId?: string;
  }): Promise<PatientVisit[]> {
    const query = this.ormRepository.createQueryBuilder('visit')
      .leftJoinAndSelect('visit.patient', 'patient')
      .leftJoinAndSelect('visit.currentRoom', 'currentRoom')
      .leftJoinAndSelect('visit.currentDoctor', 'currentDoctor')
      .leftJoinAndSelect('visit.currentNurse', 'currentNurse')
      .leftJoinAndSelect('visit.branch', 'branch')
      .leftJoin(OrderOrmEntity, 'doctorOrder', 'doctorOrder.visitId = visit.id')
      .leftJoin(OrderItemOrmEntity, 'doctorItem', 'doctorItem.orderId = doctorOrder.id')
      .distinct(true);

    if (filters.branchId) {
      query.andWhere('visit.branchId = :branchId', { branchId: filters.branchId });
    }
    if (filters.roomId) {
      query.andWhere('visit.currentRoomId = :roomId', { roomId: filters.roomId });
    }
    if (filters.status) {
      query.andWhere('visit.status = :status', { status: filters.status });
    }
    if (filters.date) {
      // Compare only date part of createdAt
      query.andWhere('DATE(visit.createdAt) = :date', { date: filters.date });
    }
    if (filters.doctorId) {
      query.andWhere(
        '(visit.currentDoctorId = :doctorId OR doctorItem.performedById = :doctorId)',
        { doctorId: filters.doctorId },
      );
    }
    if (filters.serviceId) {
      query.andWhere('doctorItem.serviceId = :serviceId', { serviceId: filters.serviceId });
    }

    query.orderBy('visit.queueNumber', 'ASC');

    const entities = await query.getMany();
    return entities.map(this.mapToDomain);
  }

  async findById(id: string): Promise<PatientVisit | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: { patient: true, currentRoom: true, currentDoctor: true, currentNurse: true, branch: true },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByCode(code: string): Promise<PatientVisit | null> {
    const entity = await this.ormRepository.findOne({
      where: { visitCode: code },
      relations: { patient: true, currentRoom: true, currentDoctor: true, currentNurse: true, branch: true },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async save(visit: Omit<PatientVisit, 'id'> & { id?: string }): Promise<PatientVisit> {
    const entity = this.ormRepository.create(visit);
    const saved = await this.ormRepository.save(entity);
    return this.mapToDomain(saved);
  }

  async getNextQueueNumber(branchId: string, date: string): Promise<number> {
    // Count how many visits in the branch on date
    const count = await this.ormRepository.createQueryBuilder('visit')
      .where('visit.branchId = :branchId', { branchId })
      .andWhere('DATE(visit.createdAt) = :date', { date })
      .getCount();
    return count + 1;
  }

  async getNextQueueCode(branchId: string, date: string, priorityLevel: string): Promise<string> {
    const count = await this.ormRepository.createQueryBuilder('visit')
      .where('visit.branchId = :branchId', { branchId })
      .andWhere('DATE(visit.createdAt) = :date', { date })
      .andWhere('visit.priorityLevel = :priorityLevel', { priorityLevel })
      .getCount();
    const nextNum = (count + 1).toString().padStart(3, '0');
    const prefix = priorityLevel === 'EMERGENCY' ? 'E' : priorityLevel === 'PRIORITY' ? 'P' : 'W';
    return `${prefix}${nextNum}`;
  }

  async countAll(): Promise<number> {
    return await this.ormRepository.count();
  }
}
