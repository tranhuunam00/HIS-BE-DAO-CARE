import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Appointment } from '../../domain/entities/appointment.model';
import type { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponseDto } from '../dtos/appointment.dto';
import { APPOINTMENT_STATUS } from '../../../../common/constants/workflow.constants';

export const IAppointmentRepositoryToken = 'IAppointmentRepository';

@Injectable()
export class ListAppointmentsUseCase {
  constructor(
    @Inject(IAppointmentRepositoryToken)
    private readonly repository: IAppointmentRepository,
  ) {}

  async execute(filters: { branchId?: string; doctorId?: string; date?: string; status?: string; phone?: string }): Promise<AppointmentResponseDto[]> {
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
      appointmentDate: model.appointmentDate,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      notes: model.notes,
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
      appointmentDate: model.appointmentDate,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      notes: model.notes,
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
  ) {}

  async execute(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    // Auto-generate appointment code
    const count = await this.repository.countAll();
    const dateStr = dto.appointmentDate.replace(/-/g, '').slice(2);
    const nextSeq = (count + 1).toString().padStart(4, '0');
    const appointmentCode = `LH${dateStr}-${nextSeq}`;

    const newAppointment = await this.repository.save({
      appointmentCode,
      patientId: dto.patientId,
      branchId: dto.branchId,
      doctorId: dto.doctorId || null,
      roomId: dto.roomId || null,
      serviceId: dto.serviceId || null,
      appointmentDate: dto.appointmentDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: APPOINTMENT_STATUS.BOOKED,
      notes: dto.notes || null,
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
      appointmentDate: model.appointmentDate,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      notes: model.notes,
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
      appointmentDate: model.appointmentDate,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      notes: model.notes,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}
