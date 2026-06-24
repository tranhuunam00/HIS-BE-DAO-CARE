import { Inject, Injectable } from '@nestjs/common';
import { IDepartmentRepositoryToken } from '../../domain/repositories/department.repository.interface';
import type { IDepartmentRepository } from '../../domain/repositories/department.repository.interface';
import { DepartmentResponseDto } from '../dtos/department.dto';

@Injectable()
export class ListDepartmentsUseCase {
  constructor(
    @Inject(IDepartmentRepositoryToken)
    private readonly departmentRepository: IDepartmentRepository
  ) {}

  async execute(branchId?: string): Promise<DepartmentResponseDto[]> {
    const list = await this.departmentRepository.findAll(branchId);
    return list.map((saved) => ({
      id: saved.id,
      branchId: saved.branchId,
      name: saved.name,
      code: saved.code,
      description: saved.description,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    }));
  }
}
