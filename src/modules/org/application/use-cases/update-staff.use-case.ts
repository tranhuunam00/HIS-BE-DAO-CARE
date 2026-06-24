import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { UpdateStaffDto, StaffResponseDto } from '../dtos/staff.dto';
import { Staff } from '../../domain/entities/staff.model';

@Injectable()
export class UpdateStaffUseCase {
  constructor(
    @Inject(IStaffRepositoryToken)
    private readonly staffRepository: IStaffRepository
  ) {}

  async execute(id: string, dto: UpdateStaffDto): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID "${id}"`);
    }

    if (dto.email && dto.email !== staff.email) {
      const existingEmail = await this.staffRepository.findByEmail(dto.email);
      if (existingEmail) {
        throw new ConflictException(`Email "${dto.email}" đã được sử dụng.`);
      }
    }

    if (dto.identityNumber && dto.identityNumber !== staff.identityNumber) {
      const existingIdNumber = await this.staffRepository.findByIdentityNumber(dto.identityNumber);
      if (existingIdNumber) {
        throw new ConflictException(`Số CCCD/Identity number "${dto.identityNumber}" đã được sử dụng.`);
      }
    }

    const updatedStaff = new Staff(
      staff.id,
      dto.fullName !== undefined ? dto.fullName : staff.fullName,
      dto.dateOfBirth !== undefined ? new Date(dto.dateOfBirth) : staff.dateOfBirth,
      dto.gender !== undefined ? dto.gender : staff.gender,
      dto.identityNumber !== undefined ? dto.identityNumber : staff.identityNumber,
      dto.phone !== undefined ? dto.phone : staff.phone,
      dto.email !== undefined ? dto.email : staff.email,
      dto.address !== undefined ? dto.address : staff.address,
      staff.staffCode, // code remains read-only
      staff.joinDate, // join date stays same or from model
      dto.title !== undefined ? dto.title : staff.title,
      dto.isClinical !== undefined ? dto.isClinical : staff.isClinical,
      staff.isActive,
      dto.userId !== undefined ? dto.userId : staff.userId,
      dto.nickname !== undefined ? dto.nickname : staff.nickname,
      dto.departmentId !== undefined ? dto.departmentId : staff.departmentId,
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
      isClinical: saved.isClinical,
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
      departmentId: saved.departmentId,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
