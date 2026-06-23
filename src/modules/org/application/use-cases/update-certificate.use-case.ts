import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { UpdatePracticingCertificateDto, PracticingCertificateResponseDto } from '../dtos/staff.dto';
import { PracticingCertificate } from '../../domain/entities/practicing-certificate.model';
import * as crypto from 'crypto';

@Injectable()
export class UpdateCertificateUseCase {
  constructor(
    @Inject(IStaffRepositoryToken)
    private readonly staffRepository: IStaffRepository
  ) {}

  async execute(staffId: string, dto: UpdatePracticingCertificateDto): Promise<PracticingCertificateResponseDto> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID "${staffId}"`);
    }

    const certId = staff.certificate ? staff.certificate.id : crypto.randomUUID();
    const now = new Date();

    const certificate = new PracticingCertificate(
      certId,
      staffId,
      dto.certificateNumber,
      new Date(dto.issuedDate),
      dto.expiryDate ? new Date(dto.expiryDate) : null,
      dto.issuedBy,
      dto.scopeOfPractice,
      dto.signatureScanUrl || null,
      staff.certificate ? staff.certificate.createdAt : now,
      now
    );

    const saved = await this.staffRepository.saveCertificate(certificate);
    return {
      id: saved.id,
      staffId: saved.staffId,
      certificateNumber: saved.certificateNumber,
      issuedDate: saved.issuedDate,
      expiryDate: saved.expiryDate,
      issuedBy: saved.issuedBy,
      scopeOfPractice: saved.scopeOfPractice,
      signatureScanUrl: saved.signatureScanUrl,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
