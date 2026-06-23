import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ISpecialtyRepositoryToken } from '../../domain/repositories/specialty.repository.interface';
import type { ISpecialtyRepository } from '../../domain/repositories/specialty.repository.interface';
import { CreateSpecialtyDto, SpecialtyResponseDto } from '../dtos/specialty.dto';
import { Specialty } from '../../domain/entities/specialty.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateSpecialtyUseCase {
  constructor(
    @Inject(ISpecialtyRepositoryToken)
    private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async execute(dto: CreateSpecialtyDto): Promise<SpecialtyResponseDto> {
    const existing = await this.specialtyRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Mã chuyên khoa "${dto.code}" đã tồn tại.`);
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const specialty = new Specialty(
      id,
      dto.code,
      dto.name,
      dto.description ?? null,
      dto.iconUrl ?? null,
      true,
      now,
      now,
    );

    const saved = await this.specialtyRepository.save(specialty);
    return {
      id: saved.id,
      code: saved.code,
      name: saved.name,
      description: saved.description,
      iconUrl: saved.iconUrl,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
