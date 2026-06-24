import { StaffScheduleTemplate } from '../entities/staff-schedule-template.model';
import { StaffScheduleOverride } from '../entities/staff-schedule-override.model';

export const IStaffScheduleRepositoryToken = 'IStaffScheduleRepository';

export interface IStaffScheduleRepository {
  findTemplatesByStaffs(staffIds: string[]): Promise<StaffScheduleTemplate[]>;
  saveTemplates(templates: StaffScheduleTemplate[]): Promise<StaffScheduleTemplate[]>;
  deleteTemplatesByStaffAndEffectiveDate(staffIds: string[], effectiveDate: string): Promise<void>;
  
  findOverrides(staffIds: string[], startDate: string, endDate: string): Promise<StaffScheduleOverride[]>;
  findOverrideById(id: string): Promise<StaffScheduleOverride | null>;
  saveOverride(override: StaffScheduleOverride): Promise<StaffScheduleOverride>;
  deleteOverride(id: string): Promise<void>;
}
