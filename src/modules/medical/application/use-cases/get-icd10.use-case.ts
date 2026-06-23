import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IIcd10RepositoryToken } from '../../domain/repositories/icd10.repository.interface';
import type { IIcd10Repository } from '../../domain/repositories/icd10.repository.interface';
import { Icd10ResponseDto } from '../dtos/icd10.dto';

@Injectable()
export class GetIcd10UseCase {
  constructor(
    @Inject(IIcd10RepositoryToken)
    private readonly icd10Repository: IIcd10Repository,
  ) {}

  async execute(id: string): Promise<Icd10ResponseDto> {
    const icd10 = await this.icd10Repository.findById(id);
    if (!icd10) {
      throw new NotFoundException(`Không tìm thấy mã ICD-10 với ID "${id}"`);
    }
    return {
      id: icd10.id,
      code: icd10.code,
      name: icd10.name,
      nameEn: icd10.nameEn,
      specialtyId: icd10.specialtyId,
      isActive: icd10.isActive,
      createdAt: icd10.createdAt,
      updatedAt: icd10.updatedAt,
    };
  }
}
