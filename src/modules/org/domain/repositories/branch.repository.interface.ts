import { Branch } from '../entities/branch.model';

export interface IBranchRepository {
  findAll(): Promise<Branch[]>;
  findById(id: string): Promise<Branch | null>;
  findByCode(code: string): Promise<Branch | null>;
  save(branch: Branch): Promise<Branch>;
}

export const IBranchRepositoryToken = Symbol('IBranchRepository');
