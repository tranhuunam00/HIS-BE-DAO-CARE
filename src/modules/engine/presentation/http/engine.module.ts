import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { ShiftOrmEntity } from '../../infrastructure/database/shift.entity';
import { StaffScheduleTemplateOrmEntity } from '../../infrastructure/database/staff-schedule-template.entity';
import { StaffScheduleOverrideOrmEntity } from '../../infrastructure/database/staff-schedule-override.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';

// Controllers
import { ShiftController } from './controllers/shift.controller';
import { StaffScheduleController } from './controllers/staff-schedule.controller';

// Repository tokens & implementations
import { IShiftRepositoryToken } from '../../domain/repositories/shift.repository.interface';
import { ShiftRepository } from '../../infrastructure/repositories/shift.repository';
import { IStaffScheduleRepositoryToken } from '../../domain/repositories/staff-schedule.repository.interface';
import { StaffScheduleRepository } from '../../infrastructure/repositories/staff-schedule.repository';

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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShiftOrmEntity,
      StaffScheduleTemplateOrmEntity,
      StaffScheduleOverrideOrmEntity,
      BranchOrmEntity,
      StaffOrmEntity,
    ]),
  ],
  controllers: [
    ShiftController,
    StaffScheduleController,
  ],
  providers: [
    // Repositories
    { provide: IShiftRepositoryToken, useClass: ShiftRepository },
    { provide: IStaffScheduleRepositoryToken, useClass: StaffScheduleRepository },

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
  ],
  exports: [
    IShiftRepositoryToken,
    IStaffScheduleRepositoryToken,
  ],
})
export class EngineModule {}
