import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PatientVisit } from '../../domain/entities/patient-visit.model';
import type { IPatientVisitRepository } from '../../domain/repositories/patient-visit.repository.interface';
import type { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { CheckInDto, UpdateVitalSignsDto, TransferRoomDto, PatientVisitResponseDto } from '../dtos/patient-visit.dto';

export const IPatientVisitRepositoryToken = 'IPatientVisitRepository';
export const IAppointmentRepositoryToken = 'IAppointmentRepository';

@Injectable()
export class ListPatientVisitsUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(filters: { branchId?: string; roomId?: string; status?: string; date?: string }): Promise<PatientVisitResponseDto[]> {
    const list = await this.repository.findAll(filters);
    return list.map(this.mapToDto);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class GetPatientVisitUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(id: string): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }
    return this.mapToDto(visit);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class CheckInUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly visitRepository: IPatientVisitRepository,
    @Inject(IAppointmentRepositoryToken)
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(dto: CheckInDto): Promise<PatientVisitResponseDto> {
    const today = new Date().toISOString().split('T')[0];

    // 1. Get next sequential Queue Number for this branch today
    const queueNumber = await this.visitRepository.getNextQueueNumber(dto.branchId, today);

    // 2. Generate visit code
    const count = await this.visitRepository.countAll();
    const dateStr = today.replace(/-/g, '').slice(2);
    const nextSeq = (count + 1).toString().padStart(4, '0');
    const visitCode = `LK${dateStr}-${nextSeq}`;

    // 3. If checking in a pre-booked appointment, update its status
    if (dto.appointmentId) {
      const appointment = await this.appointmentRepository.findById(dto.appointmentId);
      if (appointment) {
        await this.appointmentRepository.save({
          ...appointment,
          status: 'CHECKED_IN',
        });
      }
    }

    // 4. Create new visit
    const newVisit = await this.visitRepository.save({
      visitCode,
      patientId: dto.patientId,
      branchId: dto.branchId,
      appointmentId: dto.appointmentId || null,
      currentRoomId: dto.currentRoomId || null,
      currentDoctorId: dto.currentDoctorId || null,
      currentNurseId: null,
      queueNumber,
      status: 'WAITING',
      reason: dto.reason || null,
      pulse: dto.pulse || null,
      bloodPressure: dto.bloodPressure || null,
      temperature: dto.temperature || null,
      weight: dto.weight || null,
      height: dto.height || null,
    });

    return this.mapToDto(newVisit);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class UpdateVitalSignsUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(id: string, dto: UpdateVitalSignsDto): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }

    const updated = await this.repository.save({
      ...visit,
      ...dto,
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class TransferRoomUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(id: string, dto: TransferRoomDto): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }

    const updated = await this.repository.save({
      ...visit,
      currentRoomId: dto.roomId,
      currentDoctorId: dto.doctorId || null,
      currentNurseId: dto.nurseId || null,
      status: dto.status || 'WAITING',
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}
