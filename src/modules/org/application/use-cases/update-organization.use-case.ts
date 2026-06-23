import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOrganizationRepositoryToken } from '../../domain/repositories/organization.repository.interface';
import type { IOrganizationRepository } from '../../domain/repositories/organization.repository.interface';
import { UpdateOrganizationDto, OrganizationResponseDto } from '../dtos/organization.dto';
import { Organization } from '../../domain/entities/organization.model';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    @Inject(IOrganizationRepositoryToken)
    private readonly orgRepository: IOrganizationRepository
  ) {}

  async execute(dto: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    const existing = await this.orgRepository.findDefault();
    if (!existing) {
      throw new NotFoundException('Không tìm thấy cấu hình Tổ chức mặc định.');
    }

    const updated = new Organization(
      existing.id,
      dto.name !== undefined ? dto.name : existing.name,
      dto.shortName !== undefined ? dto.shortName : existing.shortName,
      existing.code, // Code cannot be modified
      dto.logoUrl !== undefined ? dto.logoUrl : existing.logoUrl,
      dto.taxCode !== undefined ? dto.taxCode : existing.taxCode,
      dto.operatingLicense !== undefined ? dto.operatingLicense : existing.operatingLicense,
      dto.legalRepresentative !== undefined ? dto.legalRepresentative : existing.legalRepresentative,
      dto.hotline !== undefined ? dto.hotline : existing.hotline,
      dto.email !== undefined ? dto.email : existing.email,
      dto.website !== undefined ? dto.website : existing.website,
      dto.address !== undefined ? dto.address : existing.address,
      dto.language !== undefined ? dto.language : existing.language,
      dto.timezone !== undefined ? dto.timezone : existing.timezone,
      dto.country !== undefined ? dto.country : existing.country,
      dto.defaultCurrency !== undefined ? dto.defaultCurrency : existing.defaultCurrency,
      dto.dateFormat !== undefined ? dto.dateFormat : existing.dateFormat,
      dto.timeFormat !== undefined ? dto.timeFormat : existing.timeFormat,
      dto.currencyFormat !== undefined ? dto.currencyFormat : existing.currencyFormat,
      dto.otpExpirationTime !== undefined ? dto.otpExpirationTime : existing.otpExpirationTime,
      dto.appointmentCancellationLimit !== undefined ? dto.appointmentCancellationLimit : existing.appointmentCancellationLimit,
      dto.mrnFormat !== undefined ? dto.mrnFormat : existing.mrnFormat,
      dto.patientCodeFormat !== undefined ? dto.patientCodeFormat : existing.patientCodeFormat,
      dto.visitCodeFormat !== undefined ? dto.visitCodeFormat : existing.visitCodeFormat,
      existing.createdAt,
      new Date()
    );

    const saved = await this.orgRepository.save(updated);
    return saved;
  }
}
