import { Patient } from '../entities/patient.model';

export interface IPatientRepository {
  findAll(search?: string): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  findByPhone(phone: string): Promise<Patient | null>;
  findByCode(code: string): Promise<Patient | null>;
  findByCccd(cccd: string): Promise<Patient | null>;
  save(patient: Omit<Patient, 'id'> & { id?: string }): Promise<Patient>;
  delete(id: string): Promise<void>;
  countAll(): Promise<number>;
}
