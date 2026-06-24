import { Department } from '../entities/department.model';

export const IDepartmentRepositoryToken = Symbol('IDepartmentRepository');

export interface IDepartmentRepository {
  findAll(branchId?: string): Promise<Department[]>;
  findById(id: string): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  save(department: Department): Promise<Department>;
}
