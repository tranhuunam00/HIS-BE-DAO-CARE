import { Icd10 } from '../entities/icd10.model';

export const IIcd10RepositoryToken = 'IIcd10Repository';

export interface IIcd10Repository {
  findAll(search?: string, page?: number, limit?: number): Promise<{ data: Icd10[]; total: number }>;
  findById(id: string): Promise<Icd10 | null>;
  findByCode(code: string): Promise<Icd10 | null>;
  save(icd10: Icd10): Promise<Icd10>;
}
