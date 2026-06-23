import { Inject, Injectable } from '@nestjs/common';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { BranchResponseDto } from '../dtos/branch.dto';

@Injectable()
export class ListBranchesUseCase {
  constructor(
    @Inject(IBranchRepositoryToken)
    private readonly branchRepository: IBranchRepository
  ) {}

  async execute(): Promise<BranchResponseDto[]> {
    const branches = await this.branchRepository.findAll();
    return branches.map((b) => ({
      id: b.id,
      organizationId: b.organizationId,
      name: b.name,
      code: b.code,
      type: b.type,
      technicalDirector: b.technicalDirector,
      operatingLicense: b.operatingLicense,
      isActive: b.isActive,
      hotline: b.hotline,
      email: b.email,
      country: b.country,
      province: b.province,
      district: b.district,
      addressDetail: b.addressDetail,
      latitude: b.latitude,
      longitude: b.longitude,
      workingDays: b.workingDays,
      openTime: b.openTime,
      closeTime: b.closeTime,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  }
}
