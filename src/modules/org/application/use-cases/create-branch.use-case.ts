import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { IOrganizationRepositoryToken } from '../../domain/repositories/organization.repository.interface';
import type { IOrganizationRepository } from '../../domain/repositories/organization.repository.interface';
import { CreateBranchDto, BranchResponseDto } from '../dtos/branch.dto';
import { Branch } from '../../domain/entities/branch.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateBranchUseCase {
  constructor(
    @Inject(IBranchRepositoryToken)
    private readonly branchRepository: IBranchRepository,
    @Inject(IOrganizationRepositoryToken)
    private readonly orgRepository: IOrganizationRepository
  ) {}

  async execute(dto: CreateBranchDto): Promise<BranchResponseDto> {
    const org = await this.orgRepository.findDefault();
    if (!org) {
      throw new NotFoundException('Không tìm thấy cấu hình Tổ chức mặc định. Vui lòng chạy dữ liệu seed.');
    }

    const existingCode = await this.branchRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException(`Mã chi nhánh "${dto.code}" đã được sử dụng.`);
    }

    const branchId = crypto.randomUUID();
    const branch = Branch.create(
      branchId,
      org.id,
      dto.name,
      dto.code,
      dto.type,
      dto.technicalDirector,
      dto.hotline,
      dto.email,
      dto.province,
      dto.district,
      dto.addressDetail,
      dto.latitude,
      dto.longitude,
      dto.workingDays,
      dto.openTime,
      dto.closeTime
    );

    const saved = await this.branchRepository.save(branch);
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
