import { StaffAttendance } from '../entities/staff-attendance.model';

export const IStaffAttendanceRepositoryToken = 'IStaffAttendanceRepository';

export interface IStaffAttendanceRepository {
  findById(id: string): Promise<StaffAttendance | null>;
  findTodayAttendance(staffId: string, date: string): Promise<StaffAttendance[]>;
  save(attendance: StaffAttendance): Promise<StaffAttendance>;
  findActiveAttendancesByStaffsAndDate(staffIds: string[], date: string): Promise<StaffAttendance[]>;
}
