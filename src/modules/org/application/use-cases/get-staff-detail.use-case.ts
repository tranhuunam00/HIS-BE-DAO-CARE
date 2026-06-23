import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { StaffResponseDto } from '../dtos/staff.dto';

@Injectable()
export class GetStaffDetailUseCase {
  constructor(
    @Inject(IStaffRepositoryToken)
    private readonly staffRepository: IStaffRepository
  ) {}

  async execute(id: string): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID "${id}"`);
    }

    return {
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
      isClinical: staff.isClinical,
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
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }
}
