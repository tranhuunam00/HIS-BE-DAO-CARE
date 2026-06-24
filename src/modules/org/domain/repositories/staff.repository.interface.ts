import { Staff } from '../entities/staff.model';
import { PracticingCertificate } from '../entities/practicing-certificate.model';

export interface IStaffRepository {
  findAll(filters?: { branchId?: string; title?: string; isActive?: boolean; roomId?: string; specialtyId?: string }): Promise<Staff[]>;
  findById(id: string): Promise<Staff | null>;
  findByCode(code: string): Promise<Staff | null>;
  findByEmail(email: string): Promise<Staff | null>;
  findByIdentityNumber(identityNumber: string): Promise<Staff | null>;
  save(staff: Staff): Promise<Staff>;
  saveCertificate(certificate: PracticingCertificate): Promise<PracticingCertificate>;
}

export const IStaffRepositoryToken = Symbol('IStaffRepository');
