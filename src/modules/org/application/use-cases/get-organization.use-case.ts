import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOrganizationRepositoryToken } from '../../domain/repositories/organization.repository.interface';
import type { IOrganizationRepository } from '../../domain/repositories/organization.repository.interface';
import { OrganizationResponseDto } from '../dtos/organization.dto';

@Injectable()
export class GetOrganizationUseCase {
  constructor(
    @Inject(IOrganizationRepositoryToken)
    private readonly orgRepository: IOrganizationRepository
  ) {}

  async execute(): Promise<OrganizationResponseDto> {
    const org = await this.orgRepository.findDefault();
    if (!org) {
      throw new NotFoundException('Không tìm thấy cấu hình Tổ chức mặc định. Vui lòng chạy dữ liệu seed.');
    }
    return org;
  }
}
