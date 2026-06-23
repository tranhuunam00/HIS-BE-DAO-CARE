import { Specialty } from '../entities/specialty.model';

export const ISpecialtyRepositoryToken = 'ISpecialtyRepository';

export interface ISpecialtyRepository {
  findAll(): Promise<Specialty[]>;
  findById(id: string): Promise<Specialty | null>;
  findByCode(code: string): Promise<Specialty | null>;
  save(specialty: Specialty): Promise<Specialty>;
}
