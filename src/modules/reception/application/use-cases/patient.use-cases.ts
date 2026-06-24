import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Patient } from '../../domain/entities/patient.model';
import type { IPatientRepository } from '../../domain/repositories/patient.repository.interface';
import { CreatePatientDto, UpdatePatientDto, PatientResponseDto } from '../dtos/patient.dto';

export const IPatientRepositoryToken = 'IPatientRepository';

@Injectable()
export class ListPatientsUseCase {
  constructor(
    @Inject(IPatientRepositoryToken)
    private readonly repository: IPatientRepository,
  ) {}

  async execute(search?: string): Promise<PatientResponseDto[]> {
    const list = await this.repository.findAll(search);
    return list.map(this.mapToDto);
  }

  private mapToDto(model: Patient): PatientResponseDto {
    return {
      id: model.id,
      patientCode: model.patientCode,
      fullName: model.fullName,
      dob: model.dob,
      gender: model.gender,
      phone: model.phone,
      email: model.email,
      address: model.address,
      cccd: model.cccd,
      guardianName: model.guardianName,
      guardianPhone: model.guardianPhone,
      guardianRelation: model.guardianRelation,
      avatarUrl: model.avatarUrl,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class GetPatientUseCase {
  constructor(
    @Inject(IPatientRepositoryToken)
    private readonly repository: IPatientRepository,
  ) {}

  async execute(id: string): Promise<PatientResponseDto> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');
    }
    return this.mapToDto(patient);
  }

  private mapToDto(model: Patient): PatientResponseDto {
    return {
      id: model.id,
      patientCode: model.patientCode,
      fullName: model.fullName,
      dob: model.dob,
      gender: model.gender,
      phone: model.phone,
      email: model.email,
      address: model.address,
      cccd: model.cccd,
      guardianName: model.guardianName,
      guardianPhone: model.guardianPhone,
      guardianRelation: model.guardianRelation,
      avatarUrl: model.avatarUrl,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class CreatePatientUseCase {
  constructor(
    @Inject(IPatientRepositoryToken)
    private readonly repository: IPatientRepository,
  ) {}

  async execute(dto: CreatePatientDto): Promise<PatientResponseDto> {
    const existing = await this.repository.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException('Số điện thoại bệnh nhân đã tồn tại trong hệ thống');
    }

    // Auto-generate patient code
    const count = await this.repository.countAll();
    const nextSeq = (count + 1).toString().padStart(4, '0');
    const patientCode = `BN-2026-${nextSeq}`;

    const newPatient = await this.repository.save({
      patientCode,
      fullName: dto.fullName,
      dob: dto.dob,
      gender: dto.gender,
      phone: dto.phone,
      email: dto.email || null,
      address: dto.address || null,
      cccd: dto.cccd || null,
      guardianName: dto.guardianName || null,
      guardianPhone: dto.guardianPhone || null,
      guardianRelation: dto.guardianRelation || null,
      avatarUrl: dto.avatarUrl || null,
    });

    return this.mapToDto(newPatient);
  }

  private mapToDto(model: Patient): PatientResponseDto {
    return {
      id: model.id,
      patientCode: model.patientCode,
      fullName: model.fullName,
      dob: model.dob,
      gender: model.gender,
      phone: model.phone,
      email: model.email,
      address: model.address,
      cccd: model.cccd,
      guardianName: model.guardianName,
      guardianPhone: model.guardianPhone,
      guardianRelation: model.guardianRelation,
      avatarUrl: model.avatarUrl,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class UpdatePatientUseCase {
  constructor(
    @Inject(IPatientRepositoryToken)
    private readonly repository: IPatientRepository,
  ) {}

  async execute(id: string, dto: UpdatePatientDto): Promise<PatientResponseDto> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');
    }

    if (dto.phone && dto.phone !== patient.phone) {
      const existing = await this.repository.findByPhone(dto.phone);
      if (existing) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi bệnh nhân khác');
      }
    }

    const updated = await this.repository.save({
      ...patient,
      ...dto,
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: Patient): PatientResponseDto {
    return {
      id: model.id,
      patientCode: model.patientCode,
      fullName: model.fullName,
      dob: model.dob,
      gender: model.gender,
      phone: model.phone,
      email: model.email,
      address: model.address,
      cccd: model.cccd,
      guardianName: model.guardianName,
      guardianPhone: model.guardianPhone,
      guardianRelation: model.guardianRelation,
      avatarUrl: model.avatarUrl,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}
