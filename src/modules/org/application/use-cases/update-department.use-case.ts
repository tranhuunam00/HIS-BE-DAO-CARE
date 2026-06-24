import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IDepartmentRepositoryToken } from '../../domain/repositories/department.repository.interface';
import type { IDepartmentRepository } from '../../domain/repositories/department.repository.interface';
import { UpdateDepartmentDto, DepartmentResponseDto } from '../dtos/department.dto';
import { Department } from '../../domain/entities/department.model';

@Injectable()
export class UpdateDepartmentUseCase {
  constructor(
    @Inject(IDepartmentRepositoryToken)
    private readonly departmentRepository: IDepartmentRepository
  ) {}

  async execute(id: string, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.departmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy bộ phận/phòng ban với ID: ${id}`);
    }

    const updated = new Department(
      existing.id,
      dto.branchId !== undefined ? dto.branchId : existing.branchId,
      dto.name !== undefined ? dto.name : existing.name,
      existing.code, // read-only
      dto.description !== undefined ? dto.description : existing.description,
      existing.isActive,
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
