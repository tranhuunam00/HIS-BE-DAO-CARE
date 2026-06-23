import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { BranchResponseDto } from '../dtos/branch.dto';

@Injectable()
export class GetBranchUseCase {
  constructor(
    @Inject(IBranchRepositoryToken)
    private readonly branchRepository: IBranchRepository
  ) {}

  async execute(id: string): Promise<BranchResponseDto> {
    const b = await this.branchRepository.findById(id);
    if (!b) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với ID: ${id}`);
    }
    return {
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
    };
  }
}
