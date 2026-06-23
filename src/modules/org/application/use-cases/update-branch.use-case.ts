import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { UpdateBranchDto, BranchResponseDto } from '../dtos/branch.dto';
import { Branch } from '../../domain/entities/branch.model';

@Injectable()
export class UpdateBranchUseCase {
  constructor(
    @Inject(IBranchRepositoryToken)
    private readonly branchRepository: IBranchRepository
  ) {}

  async execute(id: string, dto: UpdateBranchDto): Promise<BranchResponseDto> {
    const existing = await this.branchRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với ID: ${id}`);
    }

    const updated = new Branch(
      existing.id,
      existing.organizationId,
      dto.name !== undefined ? dto.name : existing.name,
      existing.code, // Code cannot be modified
      dto.type !== undefined ? dto.type : existing.type,
      dto.technicalDirector !== undefined ? dto.technicalDirector : existing.technicalDirector,
      dto.operatingLicense !== undefined ? dto.operatingLicense : existing.operatingLicense,
      existing.isActive,
      dto.hotline !== undefined ? dto.hotline : existing.hotline,
      dto.email !== undefined ? dto.email : existing.email,
      dto.country !== undefined ? dto.country : existing.country,
      dto.province !== undefined ? dto.province : existing.province,
      dto.district !== undefined ? dto.district : existing.district,
      dto.addressDetail !== undefined ? dto.addressDetail : existing.addressDetail,
      dto.latitude !== undefined ? dto.latitude : existing.latitude,
      dto.longitude !== undefined ? dto.longitude : existing.longitude,
      dto.workingDays !== undefined ? dto.workingDays : existing.workingDays,
      dto.openTime !== undefined ? dto.openTime : existing.openTime,
      dto.closeTime !== undefined ? dto.closeTime : existing.closeTime,
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
      latitude: saved.latitude,
      longitude: saved.longitude,
      workingDays: saved.workingDays,
      openTime: saved.openTime,
      closeTime: saved.closeTime,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
