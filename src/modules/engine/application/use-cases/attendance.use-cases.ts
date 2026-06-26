import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { IStaffAttendanceRepositoryToken } from '../../domain/repositories/staff-attendance.repository.interface';
import type { IStaffAttendanceRepository } from '../../domain/repositories/staff-attendance.repository.interface';
import { GetStaffSchedulesUseCase } from './staff-schedule.use-cases';
import { StaffAttendance } from '../../domain/entities/staff-attendance.model';
import { CheckInDto, CheckOutDto } from '../dtos/attendance.dto';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import {
  PATIENT_VISIT_STATUS,
  STAFF_ATTENDANCE_STATUS,
} from '../../../../common/constants/workflow.constants';

@Injectable()
export class CheckInUseCase {
  constructor(
    @Inject(IStaffAttendanceRepositoryToken)
    private readonly attendanceRepository: IStaffAttendanceRepository,
    private readonly getStaffSchedulesUseCase: GetStaffSchedulesUseCase,
  ) {}

  async execute(dto: CheckInDto): Promise<StaffAttendance> {
    // 1. Verify that staff is scheduled for this shift/branch today
    const resolvedSchedules = await this.getStaffSchedulesUseCase.execute([dto.staffId], dto.date, dto.date);
    if (resolvedSchedules.length === 0) {
      throw new BadRequestException('Không tìm thấy lịch trực của nhân viên trong ngày này');
    }

    const schedule = resolvedSchedules[0];
    if (schedule.isLeave) {
      throw new BadRequestException(`Nhân viên đã đăng ký nghỉ ngày này. Lý do: ${schedule.leaveReason}`);
    }

    const hasShift = schedule.shifts.some(
      (s) => s.shiftId === dto.shiftId && s.branchId === dto.branchId,
    );
    if (!hasShift) {
      throw new BadRequestException('Nhân viên không được phân lịch trực cho ca và chi nhánh này ngày hôm nay');
    }

    // 2. Check if already checked in for this shift today
    const todayAttendances = await this.attendanceRepository.findTodayAttendance(dto.staffId, dto.date);
    const existing = todayAttendances.find((a) => a.shiftId === dto.shiftId);
    if (existing) {
      throw new BadRequestException('Nhân viên đã điểm danh check-in ca trực này hôm nay');
    }

    // 3. Create attendance (isAcceptingPatients = true)
    const attendance = new StaffAttendance(
      '',
      dto.staffId,
      dto.branchId,
      dto.date,
      dto.shiftId,
      new Date(), // checkInTime
      null, // checkOutTime
      null, // checkoutReason
      STAFF_ATTENDANCE_STATUS.CHECKED_IN,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true, // isAcceptingPatients
    );

    return await this.attendanceRepository.save(attendance);
  }
}

@Injectable()
export class CheckOutUseCase {
  constructor(
    @Inject(IStaffAttendanceRepositoryToken)
    private readonly attendanceRepository: IStaffAttendanceRepository,
    @InjectRepository(PatientVisitOrmEntity)
    private readonly patientVisitRepository: Repository<PatientVisitOrmEntity>,
  ) {}

  async execute(dto: CheckOutDto): Promise<StaffAttendance> {
    const attendance = await this.attendanceRepository.findById(dto.attendanceId);
    if (!attendance) {
      throw new NotFoundException('Không tìm thấy bản ghi điểm danh');
    }

    if (attendance.status === STAFF_ATTENDANCE_STATUS.CHECKED_OUT || attendance.checkOutTime) {
      throw new BadRequestException('Nhân viên đã check-out ca trực này trước đó');
    }

    // Check if there are active patients in the queue for this doctor at this branch
    const remainingCount = await this.patientVisitRepository.count({
      where: {
        currentDoctorId: attendance.staffId,
        branchId: attendance.branchId,
        status: Not(In([PATIENT_VISIT_STATUS.COMPLETED, PATIENT_VISIT_STATUS.CANCELLED])),
      },
    });

    if (remainingCount > 0) {
      // Automatically disable accepting new patients
      const updatedAccepting = new StaffAttendance(
        attendance.id,
        attendance.staffId,
        attendance.branchId,
        attendance.date,
        attendance.shiftId,
        attendance.checkInTime,
        attendance.checkOutTime,
        attendance.checkoutReason,
        attendance.status,
        attendance.createdAt,
        attendance.updatedAt,
        attendance.staff,
        attendance.branch,
        attendance.shift,
        false, // isAcceptingPatients = false
      );
      await this.attendanceRepository.save(updatedAccepting);

      throw new BadRequestException(
        `Vẫn còn ${remainingCount} bệnh nhân trong hàng chờ. Vui lòng khám hết bệnh nhân hiện tại. Hệ thống đã tự động bật cờ 'Không nhận thêm bệnh nhân'.`
      );
    }

    const updated = new StaffAttendance(
      attendance.id,
      attendance.staffId,
      attendance.branchId,
      attendance.date,
      attendance.shiftId,
      attendance.checkInTime,
      new Date(), // checkOutTime
      dto.checkoutReason,
      STAFF_ATTENDANCE_STATUS.CHECKED_OUT,
      attendance.createdAt,
      attendance.updatedAt,
      attendance.staff,
      attendance.branch,
      attendance.shift,
      attendance.isAcceptingPatients,
    );

    return await this.attendanceRepository.save(updated);
  }
}

@Injectable()
export class ToggleAcceptingPatientsUseCase {
  constructor(
    @Inject(IStaffAttendanceRepositoryToken)
    private readonly attendanceRepository: IStaffAttendanceRepository,
  ) {}

  async execute(attendanceId: string, isAcceptingPatients: boolean): Promise<StaffAttendance> {
    const attendance = await this.attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new NotFoundException('Không tìm thấy bản ghi điểm danh');
    }

    const updated = new StaffAttendance(
      attendance.id,
      attendance.staffId,
      attendance.branchId,
      attendance.date,
      attendance.shiftId,
      attendance.checkInTime,
      attendance.checkOutTime,
      attendance.checkoutReason,
      attendance.status,
      attendance.createdAt,
      attendance.updatedAt,
      attendance.staff,
      attendance.branch,
      attendance.shift,
      isAcceptingPatients,
    );

    return await this.attendanceRepository.save(updated);
  }
}

@Injectable()
export class GetTodayStatusUseCase {
  constructor(
    @Inject(IStaffAttendanceRepositoryToken)
    private readonly attendanceRepository: IStaffAttendanceRepository,
  ) {}

  async execute(staffId: string, date: string): Promise<StaffAttendance[]> {
    return await this.attendanceRepository.findTodayAttendance(staffId, date);
  }
}
