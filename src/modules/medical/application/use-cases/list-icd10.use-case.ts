import { Inject, Injectable } from '@nestjs/common';
import { IIcd10RepositoryToken } from '../../domain/repositories/icd10.repository.interface';
import type { IIcd10Repository } from '../../domain/repositories/icd10.repository.interface';
import { PaginatedIcd10ResponseDto } from '../dtos/icd10.dto';

@Injectable()
export class ListIcd10UseCase {
  constructor(
    @Inject(IIcd10RepositoryToken)
    private readonly icd10Repository: IIcd10Repository,
  ) {}

  async execute(search?: string, page: number = 1, limit: number = 20): Promise<PaginatedIcd10ResponseDto> {
    const { data, total } = await this.icd10Repository.findAll(search, page, limit);
    return {
      data: data.map((i) => ({
        id: i.id,
        code: i.code,
        name: i.name,
        nameEn: i.nameEn,
        specialtyId: i.specialtyId,
        isActive: i.isActive,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
      total,
      page,
      limit,
    };
  }
}
