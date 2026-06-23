import { StaffAssignment } from '../entities/staff-assignment.model';

export interface IStaffAssignmentRepository {
  findByStaffId(staffId: string): Promise<StaffAssignment[]>;
  save(assignment: StaffAssignment): Promise<StaffAssignment>;
  delete(id: string): Promise<void>;
  clearPrimary(staffId: string): Promise<void>;
}

export const IStaffAssignmentRepositoryToken = Symbol('IStaffAssignmentRepository');
