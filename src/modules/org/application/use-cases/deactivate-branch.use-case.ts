import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { BranchResponseDto } from '../dtos/branch.dto';
import { Branch } from '../../domain/entities/branch.model';

@Injectable()
export class DeactivateBranchUseCase {
  constructor(
    @Inject(IBranchRepositoryToken)
    private readonly branchRepository: IBranchRepository
  ) {}

  async execute(id: string, isActive: boolean): Promise<BranchResponseDto> {
    const existing = await this.branchRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với ID: ${id}`);
    }

    const updated = new Branch(
      existing.id,
      existing.organizationId,
      existing.name,
      existing.code,
      existing.type,
      existing.technicalDirector,
      existing.operatingLicense,
      isActive,
      existing.hotline,
      existing.email,
      existing.country,
      existing.province,
      existing.district,
      existing.addressDetail,
      existing.googleMapUrl,
      existing.workingDays,
      existing.openTime,
      existing.closeTime,
      existing.bankName,
      existing.bankAccountNo,
      existing.bankAccountName,
      existing.createdAt,
      new Date()
    );

    const saved = await this.branchRepository.save(updated);
    return {
      id: saved.id,
      organizationId: saved.organizationId,
      name: saved.name,
      code: saved.code,
      type: saved.type,
      technicalDirector: saved.technicalDirector,
      operatingLicense: saved.operatingLicense,
      isActive: saved.isActive,
      hotline: saved.hotline,
      email: saved.email,
      country: saved.country,
      province: saved.province,
      district: saved.district,
      addressDetail: saved.addressDetail,
      googleMapUrl: saved.googleMapUrl,
      workingDays: saved.workingDays,
      openTime: saved.openTime,
      closeTime: saved.closeTime,
      bankName: saved.bankName,
      bankAccountNo: saved.bankAccountNo,
      bankAccountName: saved.bankAccountName,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
