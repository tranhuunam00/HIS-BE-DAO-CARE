import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { StaffResponseDto } from '../dtos/staff.dto';
import { Staff } from '../../domain/entities/staff.model';

@Injectable()
export class ToggleStaffStatusUseCase {
  constructor(
    @Inject(IStaffRepositoryToken)
    private readonly staffRepository: IStaffRepository
  ) {}

  async execute(id: string, isActive: boolean): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID "${id}"`);
    }

    const updatedStaff = new Staff(
      staff.id,
      staff.fullName,
      staff.dateOfBirth,
      staff.gender,
      staff.identityNumber,
      staff.phone,
      staff.email,
      staff.address,
      staff.staffCode,
      staff.joinDate,
      staff.title,
      isActive,
      staff.userId,
      staff.nickname,
      staff.avatarUrl,
      staff.academicTitle,
      staff.degree,
      staff.createdAt,
      new Date(),
      staff.certificate,
      staff.assignments
    );

    const saved = await this.staffRepository.save(updatedStaff);
    return {
      id: saved.id,
      fullName: saved.fullName,
      dateOfBirth: saved.dateOfBirth,
      gender: saved.gender,
      identityNumber: saved.identityNumber,
      phone: saved.phone,
      email: saved.email,
      address: saved.address,
      staffCode: saved.staffCode,
      joinDate: saved.joinDate,
      title: saved.title,
      isActive: saved.isActive,
      userId: saved.userId,
      certificate: saved.certificate ? {
        id: saved.certificate.id,
        staffId: saved.certificate.staffId,
        certificateNumber: saved.certificate.certificateNumber,
        issuedDate: saved.certificate.issuedDate,
        expiryDate: saved.certificate.expiryDate,
        issuedBy: saved.certificate.issuedBy,
        scopeOfPractice: saved.certificate.scopeOfPractice,
        signatureScanUrl: saved.certificate.signatureScanUrl,
        createdAt: saved.certificate.createdAt,
        updatedAt: saved.certificate.updatedAt
      } : null,
      assignments: saved.assignments ? saved.assignments.map(a => ({
        id: a.id,
        staffId: a.staffId,
        branchId: a.branchId,
        specialtyId: a.specialtyId,
        roomId: a.roomId,
        isPrimary: a.isPrimary,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      })) : [],
      nickname: saved.nickname,
      avatarUrl: saved.avatarUrl,
      academicTitle: saved.academicTitle,
      degree: saved.degree,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
