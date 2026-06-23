import { Medication } from '../entities/medication.model';

export const IMedicationRepositoryToken = 'IMedicationRepository';

export interface IMedicationRepository {
  findAll(search?: string): Promise<Medication[]>;
  findById(id: string): Promise<Medication | null>;
  findByCode(code: string): Promise<Medication | null>;
  findByNationalCode(nationalCode: string): Promise<Medication | null>;
  save(medication: Medication): Promise<Medication>;
}
