import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IDepartmentRepositoryToken } from '../../domain/repositories/department.repository.interface';
import type { IDepartmentRepository } from '../../domain/repositories/department.repository.interface';
import { DepartmentResponseDto } from '../dtos/department.dto';
import { Department } from '../../domain/entities/department.model';

@Injectable()
export class ToggleDepartmentStatusUseCase {
  constructor(
    @Inject(IDepartmentRepositoryToken)
    private readonly departmentRepository: IDepartmentRepository
  ) {}

  async execute(id: string, isActive: boolean): Promise<DepartmentResponseDto> {
    const existing = await this.departmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy bộ phận/phòng ban với ID: ${id}`);
    }

    const updated = new Department(
      existing.id,
      existing.branchId,
      existing.name,
      existing.code,
      existing.description,
      isActive,
      existing.createdAt,
      new Date()
    );

    const saved = await this.departmentRepository.save(updated);
    return {
      id: saved.id,
      branchId: saved.branchId,
      name: saved.name,
      code: saved.code,
      description: saved.description,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
