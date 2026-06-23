import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IIcd10RepositoryToken } from '../../domain/repositories/icd10.repository.interface';
import type { IIcd10Repository } from '../../domain/repositories/icd10.repository.interface';
import { CreateIcd10Dto, Icd10ResponseDto } from '../dtos/icd10.dto';
import { Icd10 } from '../../domain/entities/icd10.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateIcd10UseCase {
  constructor(
    @Inject(IIcd10RepositoryToken)
    private readonly icd10Repository: IIcd10Repository,
  ) {}

  async execute(dto: CreateIcd10Dto): Promise<Icd10ResponseDto> {
    const existing = await this.icd10Repository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Mã ICD-10 "${dto.code}" đã tồn tại.`);
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const icd10 = new Icd10(
      id,
      dto.code,
      dto.name,
      dto.nameEn ?? null,
      dto.specialtyId ?? null,
      true,
      now,
      now,
    );

    const saved = await this.icd10Repository.save(icd10);
    return {
      id: saved.id,
      code: saved.code,
      name: saved.name,
      nameEn: saved.nameEn,
      specialtyId: saved.specialtyId,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
