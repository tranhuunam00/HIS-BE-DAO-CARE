import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../domain/entities/appointment.model';
import { AppointmentOrmEntity } from '../database/appointment.entity';

@Injectable()
export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    @InjectRepository(AppointmentOrmEntity)
    private readonly ormRepository: Repository<AppointmentOrmEntity>,
  ) {}

  private mapToDomain(entity: AppointmentOrmEntity): Appointment {
    return new Appointment(
      entity.id,
      entity.appointmentCode,
      entity.patientId,
      entity.branchId,
      entity.doctorId,
      entity.roomId,
      entity.serviceId,
      entity.appointmentDate,
      entity.startTime,
      entity.endTime,
      entity.status,
      entity.notes,
      entity.createdAt,
      entity.updatedAt,
      entity.patient,
      entity.doctor,
      entity.room,
      entity.service,
    );
  }

  async findAll(filters: { branchId?: string; doctorId?: string; date?: string; status?: string; phone?: string }): Promise<Appointment[]> {
    const query = this.ormRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.room', 'room')
      .leftJoinAndSelect('appointment.service', 'service');

    if (filters.branchId) {
      query.andWhere('appointment.branchId = :branchId', { branchId: filters.branchId });
    }
    if (filters.doctorId) {
      query.andWhere('appointment.doctorId = :doctorId', { doctorId: filters.doctorId });
    }
    if (filters.date) {
      query.andWhere('appointment.appointmentDate = :date', { date: filters.date });
    }
    if (filters.status) {
      query.andWhere('appointment.status = :status', { status: filters.status });
    }
    if (filters.phone) {
      query.andWhere('patient.phone LIKE :phone', { phone: `%${filters.phone}%` });
    }

    query.orderBy('appointment.appointmentDate', 'ASC')
         .addOrderBy('appointment.startTime', 'ASC');

    const entities = await query.getMany();
    // Return them with full attached relations. Since TypeORM will have populated them on the entities,
    // we can return the raw entities or map them.
    // To match interface, we map to domain, but since NestJS controller might want to return patients/doctors details,
    // we can return mapped domain objects but attach the relations as optional properties,
    // or just return the mapped array and allow use cases to return response DTOs.
    // Let's return mapped domain objects, and we'll fetch details or load relations in the query builder.
    // Wait! Let's define the domain model with optional nested objects if we need them,
    // or we can just return the database entities themselves, or map relations on the DTO.
    // Mapping relations on the use-case/DTO is standard.
    // Let's make sure the use-case loads the relation.
    return entities.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Appointment | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: { patient: true, doctor: true, room: true, service: true, branch: true },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Appointment | null> {
    const entity = await this.ormRepository.findOne({
      where: { appointmentCode: code },
      relations: { patient: true, doctor: true, room: true, service: true, branch: true },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async save(appointment: Omit<Appointment, 'id'> & { id?: string }): Promise<Appointment> {
    const entity = this.ormRepository.create(appointment);
    const saved = await this.ormRepository.save(entity);
    return this.mapToDomain(saved);
  }

  async countAll(): Promise<number> {
    return await this.ormRepository.count();
  }

  async getDoctorAppointments(doctorId: string, date: string): Promise<Appointment[]> {
    const entities = await this.ormRepository.find({
      where: { doctorId, appointmentDate: date },
      order: { startTime: 'ASC' },
    });
    return entities.map(this.mapToDomain);
  }
}
