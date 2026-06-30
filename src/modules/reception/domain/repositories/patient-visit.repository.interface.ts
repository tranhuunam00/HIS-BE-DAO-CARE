import { PatientVisit } from '../entities/patient-visit.model';

export interface IPatientVisitRepository {
  findAll(filters: {
    branchId?: string;
    roomId?: string;
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    doctorId?: string;
    serviceId?: string;
    patientId?: string;
  }): Promise<PatientVisit[]>;
  findById(id: string): Promise<PatientVisit | null>;
  findByCode(code: string): Promise<PatientVisit | null>;
  save(visit: Omit<PatientVisit, 'id'> & { id?: string }): Promise<PatientVisit>;
  getNextQueueNumber(branchId: string, date: string): Promise<number>;
  getNextQueueCode(branchId: string, date: string, priorityLevel: string): Promise<string>;
  countAll(): Promise<number>;
}
