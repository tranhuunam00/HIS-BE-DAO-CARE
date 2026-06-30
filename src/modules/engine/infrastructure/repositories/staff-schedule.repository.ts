import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { IStaffScheduleRepository } from '../../domain/repositories/staff-schedule.repository.interface';
import { StaffScheduleTemplate } from '../../domain/entities/staff-schedule-template.model';
import { StaffScheduleOverride } from '../../domain/entities/staff-schedule-override.model';
import { StaffScheduleTemplateOrmEntity } from '../database/staff-schedule-template.entity';
import { StaffScheduleOverrideOrmEntity } from '../database/staff-schedule-override.entity';

@Injectable()
export class StaffScheduleRepository implements IStaffScheduleRepository {
  constructor(
    @InjectRepository(StaffScheduleTemplateOrmEntity)
    private readonly templateOrmRepository: Repository<StaffScheduleTemplateOrmEntity>,
    @InjectRepository(StaffScheduleOverrideOrmEntity)
    private readonly overrideOrmRepository: Repository<StaffScheduleOverrideOrmEntity>,
  ) {}

  async findTemplatesByStaffs(staffIds: string[]): Promise<StaffScheduleTemplate[]> {
    if (staffIds.length === 0) return [];
    const orms = await this.templateOrmRepository.find({
      where: { staffId: In(staffIds) },
      order: { effectiveDate: 'ASC' },
    });
    return orms.map((o) => this.templateToDomain(o));
  }

  async saveTemplates(templates: StaffScheduleTemplate[]): Promise<StaffScheduleTemplate[]> {
    const orms = templates.map((t) => this.templateToOrm(t));
    const saved = await this.templateOrmRepository.save(orms);
    return saved.map((o) => this.templateToDomain(o));
  }

  async deleteTemplatesByStaffAndEffectiveDate(staffIds: string[], effectiveDate: string): Promise<void> {
    if (staffIds.length === 0) return;
    await this.templateOrmRepository.delete({
      staffId: In(staffIds),
      effectiveDate,
    });
  }

  async findOverrides(staffIds: string[], startDate: string, endDate: string): Promise<StaffScheduleOverride[]> {
    if (staffIds.length === 0) return [];
    const orms = await this.overrideOrmRepository.find({
      where: {
        staffId: In(staffIds),
        date: Between(startDate, endDate),
      },
    });
    return orms.map((o) => this.overrideToDomain(o));
  }

  async findOverrideById(id: string): Promise<StaffScheduleOverride | null> {
    const orm = await this.overrideOrmRepository.findOne({ where: { id } });
    return orm ? this.overrideToDomain(orm) : null;
  }

  async saveOverride(override: StaffScheduleOverride): Promise<StaffScheduleOverride> {
    const orm = this.overrideToOrm(override);
    const saved = await this.overrideOrmRepository.save(orm);
    return this.overrideToDomain(saved);
  }

  async deleteOverride(id: string): Promise<void> {
    await this.overrideOrmRepository.delete(id);
  }

  // Mapper helpers
  private formatDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') {
      if (date.includes('T')) {
        return date.split('T')[0];
      }
      return date;
    }
    if (date instanceof Date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return String(date);
  }

  private templateToDomain(orm: StaffScheduleTemplateOrmEntity): StaffScheduleTemplate {
    return new StaffScheduleTemplate(
      orm.id,
      orm.staffId,
      orm.branchId,
      orm.dayOfWeek,
      orm.shiftId,
      this.formatDate(orm.effectiveDate),
      orm.roomId,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private templateToOrm(domain: StaffScheduleTemplate): StaffScheduleTemplateOrmEntity {
    const orm = new StaffScheduleTemplateOrmEntity();
    if (domain.id) orm.id = domain.id;
    orm.staffId = domain.staffId;
    orm.branchId = domain.branchId;
    orm.dayOfWeek = domain.dayOfWeek;
    orm.shiftId = domain.shiftId;
    orm.effectiveDate = domain.effectiveDate;
    orm.roomId = domain.roomId;
    return orm;
  }

  private overrideToDomain(orm: StaffScheduleOverrideOrmEntity): StaffScheduleOverride {
    return new StaffScheduleOverride(
      orm.id,
      orm.staffId,
      this.formatDate(orm.date),
      orm.overrideType,
      orm.branchId,
      orm.shiftId,
      orm.reason,
      orm.roomId,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private overrideToOrm(domain: StaffScheduleOverride): StaffScheduleOverrideOrmEntity {
    const orm = new StaffScheduleOverrideOrmEntity();
    if (domain.id) orm.id = domain.id;
    orm.staffId = domain.staffId;
    orm.date = domain.date;
    orm.overrideType = domain.overrideType;
    orm.branchId = domain.branchId;
    orm.shiftId = domain.shiftId;
    orm.reason = domain.reason;
    orm.roomId = domain.roomId;
    return orm;
  }
}
