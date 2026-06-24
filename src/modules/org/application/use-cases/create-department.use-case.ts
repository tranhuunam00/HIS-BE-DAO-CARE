import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IDepartmentRepositoryToken } from '../../domain/repositories/department.repository.interface';
import type { IDepartmentRepository } from '../../domain/repositories/department.repository.interface';
import { CreateDepartmentDto, DepartmentResponseDto } from '../dtos/department.dto';
import { Department } from '../../domain/entities/department.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateDepartmentUseCase {
  constructor(
    @Inject(IDepartmentRepositoryToken)
    private readonly departmentRepository: IDepartmentRepository
  ) {}

  async execute(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const existingCode = await this.departmentRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException(`Mã bộ phận/phòng ban "${dto.code}" đã được sử dụng.`);
    }

    const id = crypto.randomUUID();
    const department = Department.create(
      id,
      dto.branchId || null,
      dto.name,
      dto.code,
      dto.description
    );

    const saved = await this.departmentRepository.save(department);
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
