import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { ShiftOrmEntity } from '../../infrastructure/database/shift.entity';
import { StaffScheduleTemplateOrmEntity } from '../../infrastructure/database/staff-schedule-template.entity';
import { StaffScheduleOverrideOrmEntity } from '../../infrastructure/database/staff-schedule-override.entity';
import { StaffAttendanceOrmEntity } from '../../infrastructure/database/staff-attendance.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';

// Controllers
import { ShiftController } from './controllers/shift.controller';
import { StaffScheduleController } from './controllers/staff-schedule.controller';
import { AttendanceController } from './controllers/attendance.controller';

// Repository tokens & implementations
import { IShiftRepositoryToken } from '../../domain/repositories/shift.repository.interface';
import { ShiftRepository } from '../../infrastructure/repositories/shift.repository';
import { IStaffScheduleRepositoryToken } from '../../domain/repositories/staff-schedule.repository.interface';
import { StaffScheduleRepository } from '../../infrastructure/repositories/staff-schedule.repository';
import { IStaffAttendanceRepositoryToken } from '../../domain/repositories/staff-attendance.repository.interface';
import { StaffAttendanceRepository } from '../../infrastructure/repositories/staff-attendance.repository';

// Use Cases - Shifts
import {
  ListShiftsUseCase,
  CreateShiftUseCase,
  UpdateShiftUseCase,
  ToggleShiftStatusUseCase,
} from '../../application/use-cases/shift.use-cases';

// Use Cases - Schedules
import {
  GetStaffSchedulesUseCase,
  UpdateStaffScheduleTemplateUseCase,
  CreateStaffScheduleOverrideUseCase,
  RemoveStaffScheduleOverrideUseCase,
} from '../../application/use-cases/staff-schedule.use-cases';

// Use Cases - Attendance
import {
  CheckInUseCase,
  CheckOutUseCase,
  GetTodayStatusUseCase,
} from '../../application/use-cases/attendance.use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShiftOrmEntity,
      StaffScheduleTemplateOrmEntity,
      StaffScheduleOverrideOrmEntity,
      StaffAttendanceOrmEntity,
      BranchOrmEntity,
      StaffOrmEntity,
    ]),
  ],
  controllers: [
    ShiftController,
    StaffScheduleController,
    AttendanceController,
  ],
  providers: [
    // Repositories
    { provide: IShiftRepositoryToken, useClass: ShiftRepository },
    { provide: IStaffScheduleRepositoryToken, useClass: StaffScheduleRepository },
    { provide: IStaffAttendanceRepositoryToken, useClass: StaffAttendanceRepository },

    // Use cases - Shifts
    ListShiftsUseCase,
    CreateShiftUseCase,
    UpdateShiftUseCase,
    ToggleShiftStatusUseCase,

    // Use cases - Schedules
    GetStaffSchedulesUseCase,
    UpdateStaffScheduleTemplateUseCase,
    CreateStaffScheduleOverrideUseCase,
    RemoveStaffScheduleOverrideUseCase,

    // Use cases - Attendance
    CheckInUseCase,
    CheckOutUseCase,
    GetTodayStatusUseCase,
  ],
  exports: [
    IShiftRepositoryToken,
    IStaffScheduleRepositoryToken,
    IStaffAttendanceRepositoryToken,
  ],
})
export class EngineModule {}

