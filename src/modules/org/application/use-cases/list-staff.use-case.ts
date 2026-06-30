import { Inject, Injectable } from '@nestjs/common';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { StaffResponseDto } from '../dtos/staff.dto';

@Injectable()
export class ListStaffUseCase {
  constructor(
    @Inject(IStaffRepositoryToken)
    private readonly staffRepository: IStaffRepository
  ) {}

  async execute(filters?: { branchId?: string; title?: string; isActive?: boolean; roomId?: string; specialtyId?: string }): Promise<StaffResponseDto[]> {
    const staffList = await this.staffRepository.findAll(filters);
    return staffList.map((staff) => ({
      id: staff.id,
      fullName: staff.fullName,
      dateOfBirth: staff.dateOfBirth,
      gender: staff.gender,
      identityNumber: staff.identityNumber,
      phone: staff.phone,
      email: staff.email,
      address: staff.address,
      staffCode: staff.staffCode,
      joinDate: staff.joinDate,
      title: staff.title,
      isActive: staff.isActive,
      userId: staff.userId,
      certificate: staff.certificate ? {
        id: staff.certificate.id,
        staffId: staff.certificate.staffId,
        certificateNumber: staff.certificate.certificateNumber,
        issuedDate: staff.certificate.issuedDate,
        expiryDate: staff.certificate.expiryDate,
        issuedBy: staff.certificate.issuedBy,
        scopeOfPractice: staff.certificate.scopeOfPractice,
        signatureScanUrl: staff.certificate.signatureScanUrl,
        createdAt: staff.certificate.createdAt,
        updatedAt: staff.certificate.updatedAt
      } : null,
      assignments: staff.assignments ? staff.assignments.map(a => ({
        id: a.id,
        staffId: a.staffId,
        branchId: a.branchId,
        specialtyId: a.specialtyId,
        roomId: a.roomId,
        isPrimary: a.isPrimary,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      })) : [],
      nickname: staff.nickname,
      avatarUrl: staff.avatarUrl,
      academicTitle: staff.academicTitle,
      degree: staff.degree,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    }));
  }
}
