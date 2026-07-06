import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Appointment } from '../../domain/entities/appointment.model';
import type { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import type { IPatientRepository } from '../../domain/repositories/patient.repository.interface';
import { IPatientRepositoryToken } from './patient.use-cases';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponseDto } from '../dtos/appointment.dto';
import { APPOINTMENT_STATUS } from '../../../../common/constants/workflow.constants';

export const IAppointmentRepositoryToken = 'IAppointmentRepository';

@Injectable()
export class ListAppointmentsUseCase {
  constructor(
    @Inject(IAppointmentRepositoryToken)
    private readonly repository: IAppointmentRepository,
  ) {}

  async execute(filters: { branchId?: string; doctorId?: string; date?: string; status?: string; phone?: string; startDate?: string; endDate?: string }): Promise<AppointmentResponseDto[]> {
    const list = await this.repository.findAll(filters);
    return list.map(this.mapToDto);
  }

  private mapToDto(model: Appointment): AppointmentResponseDto {
    return {
      id: model.id,
      appointmentCode: model.appointmentCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      doctorId: model.doctorId,
      doctor: model.doctor,
      roomId: model.roomId,
      room: model.room,
      serviceId: model.serviceId,
      service: model.service,
      specialtyId: model.specialtyId || null,
      appointmentDate: model.appointmentDate,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      notes: model.notes,
      phone: model.phone,
      isGuest: model.isGuest,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class GetAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepositoryToken)
    private readonly repository: IAppointmentRepository,
  ) {}

  async execute(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }
    return this.mapToDto(appointment);
  }

  private mapToDto(model: Appointment): AppointmentResponseDto {
    return {
      id: model.id,
      appointmentCode: model.appointmentCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      doctorId: model.doctorId,
      doctor: model.doctor,
      roomId: model.roomId,
      room: model.room,
      serviceId: model.serviceId,
      service: model.service,
      specialtyId: model.specialtyId || null,
      appointmentDate: model.appointmentDate,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      notes: model.notes,
      phone: model.phone,
      isGuest: model.isGuest,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepositoryToken)
    private readonly repository: IAppointmentRepository,
    @Inject(IPatientRepositoryToken)
    private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    let patientId = dto.patientId;
    const isGuest = !patientId;

    // Resolve patientId if not provided (guest booking flow)
    if (!patientId) {
      if (!dto.phone) {
        throw new ConflictException('Số điện thoại liên hệ là bắt buộc khi đặt lịch vãng lai');
      }

      // Check if patient with this phone number already exists
      const existingPatient = await this.patientRepository.findByPhone(dto.phone);
      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Auto-create a new patient profile
        const countPatients = await this.patientRepository.countAll();
        const nextSeqPatient = (countPatients + 1).toString().padStart(4, '0');
        const patientCode = `BN-2026-${nextSeqPatient}`;

        const newPatient = await this.patientRepository.save({
          patientCode,
          fullName: dto.patientFullName || 'Khách vãng lai',
          dob: dto.patientDob || null,
          gender: 'OTHER',
          phone: dto.phone,
          email: null,
          address: null,
          cccd: null,
          guardianName: null,
          guardianPhone: null,
          guardianRelation: null,
          avatarUrl: null,
        });
        patientId = newPatient.id;
      }
    }

    // Auto-generate appointment code
    const count = await this.repository.countAll();
    const dateStr = dto.appointmentDate.replace(/-/g, '').slice(2);
    const nextSeq = (count + 1).toString().padStart(4, '0');
    const appointmentCode = `LH${dateStr}-${nextSeq}`;

    const newAppointment = await this.repository.save({
      appointmentCode,
      patientId,
      branchId: dto.branchId,
      doctorId: dto.doctorId || null,
      roomId: dto.roomId || null,
      serviceId: dto.serviceId || null,
      specialtyId: dto.specialtyId || null,
      appointmentDate: dto.appointmentDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: APPOINTMENT_STATUS.BOOKED,
      notes: dto.notes || null,
      phone: dto.phone || null,
      isGuest,
    });

    return this.mapToDto(newAppointment);
  }

  private mapToDto(model: Appointment): AppointmentResponseDto {
    return {
      id: model.id,
      appointmentCode: model.appointmentCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      doctorId: model.doctorId,
      doctor: model.doctor,
      roomId: model.roomId,
      room: model.room,
      serviceId: model.serviceId,
      service: model.service,
      specialtyId: model.specialtyId || null,
      appointmentDate: model.appointmentDate,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      notes: model.notes,
      phone: model.phone,
      isGuest: model.isGuest,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepositoryToken)
    private readonly repository: IAppointmentRepository,
  ) {}

  async execute(id: string, dto: UpdateAppointmentDto): Promise<AppointmentResponseDto> {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }

    if (appointment.status !== APPOINTMENT_STATUS.BOOKED && appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
      throw new ConflictException('Không thể chỉnh sửa lịch hẹn đã tiếp nhận hoặc đã hủy');
    }

    const updated = await this.repository.save({
      ...appointment,
      ...dto,
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: Appointment): AppointmentResponseDto {
    return {
      id: model.id,
      appointmentCode: model.appointmentCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      doctorId: model.doctorId,
      doctor: model.doctor,
      roomId: model.roomId,
      room: model.room,
      serviceId: model.serviceId,
      service: model.service,
      specialtyId: model.specialtyId || null,
      appointmentDate: model.appointmentDate,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      notes: model.notes,
      phone: model.phone,
      isGuest: model.isGuest,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}
