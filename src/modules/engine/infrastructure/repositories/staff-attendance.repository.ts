import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IStaffAttendanceRepository } from '../../domain/repositories/staff-attendance.repository.interface';
import { StaffAttendance } from '../../domain/entities/staff-attendance.model';
import { StaffAttendanceOrmEntity } from '../database/staff-attendance.entity';
import { STAFF_ATTENDANCE_STATUS } from '../../../../common/constants/workflow.constants';

@Injectable()
export class StaffAttendanceRepository implements IStaffAttendanceRepository {
  constructor(
    @InjectRepository(StaffAttendanceOrmEntity)
    private readonly attendanceOrmRepository: Repository<StaffAttendanceOrmEntity>,
  ) {}

  async findById(id: string): Promise<StaffAttendance | null> {
    const orm = await this.attendanceOrmRepository.findOne({
      where: { id },
      relations: { staff: true, branch: true, shift: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findTodayAttendance(staffId: string, date: string): Promise<StaffAttendance[]> {
    const orms = await this.attendanceOrmRepository.find({
      where: { staffId, date },
      relations: { staff: true, branch: true, shift: true },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async save(attendance: StaffAttendance): Promise<StaffAttendance> {
    const orm = this.toOrm(attendance);
    const saved = await this.attendanceOrmRepository.save(orm);
    const reloaded = await this.findById(saved.id);
    if (!reloaded) {
      throw new Error('StaffAttendance could not be reloaded after saving');
    }
    return reloaded;
  }

  async findActiveAttendancesByStaffsAndDate(staffIds: string[], date: string): Promise<StaffAttendance[]> {
    if (staffIds.length === 0) return [];
    const orms = await this.attendanceOrmRepository.find({
      where: { staffId: In(staffIds), date, status: STAFF_ATTENDANCE_STATUS.CHECKED_IN },
      relations: { staff: true, branch: true, shift: true },
    });
    return orms.map((o) => this.toDomain(o));
  }

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

  private toDomain(orm: StaffAttendanceOrmEntity): StaffAttendance {
    return new StaffAttendance(
      orm.id,
      orm.staffId,
      orm.branchId,
      this.formatDate(orm.date),
      orm.shiftId,
      orm.checkInTime,
      orm.checkOutTime,
      orm.checkoutReason,
      orm.status,
      orm.createdAt,
      orm.updatedAt,
      orm.staff,
      orm.branch,
      orm.shift,
      orm.isAcceptingPatients,
    );
  }

  private toOrm(domain: StaffAttendance): StaffAttendanceOrmEntity {
    const orm = new StaffAttendanceOrmEntity();
    if (domain.id) orm.id = domain.id;
    orm.staffId = domain.staffId;
    orm.branchId = domain.branchId;
    orm.date = domain.date;
    orm.shiftId = domain.shiftId;
    orm.checkInTime = domain.checkInTime;
    orm.checkOutTime = domain.checkOutTime;
    orm.checkoutReason = domain.checkoutReason;
    orm.status = domain.status;
    orm.isAcceptingPatients = domain.isAcceptingPatients;
    return orm;
  }
}
