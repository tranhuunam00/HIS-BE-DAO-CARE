import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStaffScheduleRepositoryToken } from '../../domain/repositories/staff-schedule.repository.interface';
import type { IStaffScheduleRepository } from '../../domain/repositories/staff-schedule.repository.interface';
import { IShiftRepositoryToken } from '../../domain/repositories/shift.repository.interface';
import type { IShiftRepository } from '../../domain/repositories/shift.repository.interface';
import { StaffScheduleTemplate } from '../../domain/entities/staff-schedule-template.model';
import { StaffScheduleOverride } from '../../domain/entities/staff-schedule-override.model';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { RoomOrmEntity } from '../../../org/infrastructure/database/room.entity';
import { StaffAssignmentOrmEntity } from '../../../org/infrastructure/database/staff-assignment.entity';
import {
  UpdateStaffScheduleTemplateDto,
  CreateOverrideDto,
  StaffScheduleOverrideResponseDto,
  ResolvedScheduleResponseDto,
  ResolvedScheduleShiftDto,
} from '../dtos/schedule.dto';
import { SCHEDULE_OVERRIDE_TYPE } from '../../../../common/constants/workflow.constants';

@Injectable()
export class UpdateStaffScheduleTemplateUseCase {
  constructor(
    @Inject(IStaffScheduleRepositoryToken)
    private readonly scheduleRepository: IStaffScheduleRepository,
    @Inject(IShiftRepositoryToken)
    private readonly shiftRepository: IShiftRepository,
    @InjectRepository(BranchOrmEntity)
    private readonly branchOrmRepository: Repository<BranchOrmEntity>,
    @InjectRepository(StaffOrmEntity)
    private readonly staffOrmRepository: Repository<StaffOrmEntity>,
    @InjectRepository(RoomOrmEntity)
    private readonly roomOrmRepository: Repository<RoomOrmEntity>,
    @InjectRepository(StaffAssignmentOrmEntity)
    private readonly staffAssignmentRepository: Repository<StaffAssignmentOrmEntity>,
  ) {}

  async execute(dto: UpdateStaffScheduleTemplateDto): Promise<void> {
    // 1. Verify staff members exist
    for (const staffId of dto.staffIds) {
      const exists = await this.staffOrmRepository.findOne({ where: { id: staffId } });
      if (!exists) {
        throw new NotFoundException(`Không tìm thấy nhân viên với ID ${staffId}`);
      }

      // Verify staff assignments (branch & room)
      const assignments = await this.staffAssignmentRepository.find({ where: { staffId } });

      for (const item of dto.items) {
        const branchAssigned = assignments.some(a => a.branchId === item.branchId);
        if (!branchAssigned) {
          throw new BadRequestException(`Nhân viên không được phân công làm việc tại chi nhánh này`);
        }

        if (item.roomId) {
          const roomAssigned = assignments.some(a => a.branchId === item.branchId && (a.roomId === item.roomId || !a.roomId));
          if (!roomAssigned) {
            throw new BadRequestException(`Nhân viên không được phân công làm việc tại phòng này`);
          }
        }
      }
    }

    // 2. Verify shifts, branches and rooms in items
    const shiftIds = Array.from(new Set(dto.items.map((i) => i.shiftId)));
    const branchIds = Array.from(new Set(dto.items.map((i) => i.branchId)));
    const roomIds = Array.from(new Set(dto.items.map((i) => i.roomId).filter(Boolean)));

    for (const sId of shiftIds) {
      const exists = await this.shiftRepository.findById(sId);
      if (!exists) {
        throw new NotFoundException(`Không tìm thấy ca trực với ID ${sId}`);
      }
    }

    for (const bId of branchIds) {
      const exists = await this.branchOrmRepository.findOne({ where: { id: bId } });
      if (!exists) {
        throw new NotFoundException(`Không tìm thấy chi nhánh với ID ${bId}`);
      }
    }

    for (const rId of roomIds) {
      const exists = await this.roomOrmRepository.findOne({ where: { id: rId } });
      if (!exists) {
        throw new NotFoundException(`Không tìm thấy phòng với ID ${rId}`);
      }
    }

    // 3. Clear existing templates on this effective date and write new ones
    await this.scheduleRepository.deleteTemplatesByStaffAndEffectiveDate(dto.staffIds, dto.effectiveDate);

    const templatesToSave: StaffScheduleTemplate[] = [];
    for (const staffId of dto.staffIds) {
      for (const item of dto.items) {
        templatesToSave.push(
          new StaffScheduleTemplate(
            '',
            staffId,
            item.branchId,
            item.dayOfWeek,
            item.shiftId,
            dto.effectiveDate,
            item.roomId ?? null,
          ),
        );
      }
    }

    if (templatesToSave.length > 0) {
      await this.scheduleRepository.saveTemplates(templatesToSave);
    }
  }
}

@Injectable()
export class CreateStaffScheduleOverrideUseCase {
  constructor(
    @Inject(IStaffScheduleRepositoryToken)
    private readonly scheduleRepository: IStaffScheduleRepository,
    @Inject(IShiftRepositoryToken)
    private readonly shiftRepository: IShiftRepository,
    @InjectRepository(BranchOrmEntity)
    private readonly branchOrmRepository: Repository<BranchOrmEntity>,
    @InjectRepository(StaffOrmEntity)
    private readonly staffOrmRepository: Repository<StaffOrmEntity>,
    @InjectRepository(RoomOrmEntity)
    private readonly roomOrmRepository: Repository<RoomOrmEntity>,
    @InjectRepository(StaffAssignmentOrmEntity)
    private readonly staffAssignmentRepository: Repository<StaffAssignmentOrmEntity>,
  ) {}

  async execute(dto: CreateOverrideDto): Promise<StaffScheduleOverrideResponseDto> {
    // 1. Verify staff exists
    const staff = await this.staffOrmRepository.findOne({ where: { id: dto.staffId } });
    if (!staff) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    // 2. Verify shift & branch if type is WORK
    if (dto.overrideType === SCHEDULE_OVERRIDE_TYPE.WORK) {
      if (!dto.shiftId || !dto.branchId) {
        throw new BadRequestException('Vui lòng cung cấp Ca trực và Chi nhánh làm việc');
      }

      const shiftExists = await this.shiftRepository.findById(dto.shiftId);
      if (!shiftExists) {
        throw new NotFoundException('Không tìm thấy ca trực');
      }

      const branchExists = await this.branchOrmRepository.findOne({ where: { id: dto.branchId } });
      if (!branchExists) {
        throw new NotFoundException('Không tìm thấy chi nhánh');
      }

      // Verify staff assignments (branch & room)
      const assignments = await this.staffAssignmentRepository.find({ where: { staffId: dto.staffId } });
      const branchAssigned = assignments.some(a => a.branchId === dto.branchId);
      if (!branchAssigned) {
        throw new BadRequestException('Nhân viên không được phân công làm việc tại chi nhánh này');
      }

      if (dto.roomId) {
        const roomExists = await this.roomOrmRepository.findOne({ where: { id: dto.roomId } });
        if (!roomExists) {
          throw new NotFoundException('Không tìm thấy phòng');
        }

        const roomAssigned = assignments.some(a => a.branchId === dto.branchId && (a.roomId === dto.roomId || !a.roomId));
        if (!roomAssigned) {
          throw new BadRequestException('Nhân viên không được phân công làm việc tại phòng này');
        }
      }
    }

    // 3. Delete existing override on this date for this staff
    const existing = await this.scheduleRepository.findOverrides([dto.staffId], dto.date, dto.date);
    for (const old of existing) {
      await this.scheduleRepository.deleteOverride(old.id);
    }

    // 4. Save new override
    const override = new StaffScheduleOverride(
      '',
      dto.staffId,
      dto.date,
      dto.overrideType,
      dto.overrideType === SCHEDULE_OVERRIDE_TYPE.WORK ? dto.branchId! : null,
      dto.overrideType === SCHEDULE_OVERRIDE_TYPE.WORK ? dto.shiftId! : null,
      dto.reason ?? null,
      dto.overrideType === SCHEDULE_OVERRIDE_TYPE.WORK ? dto.roomId ?? null : null,
    );

    const saved = await this.scheduleRepository.saveOverride(override);
    return this.mapToDto(saved);
  }

  private mapToDto(domain: StaffScheduleOverride): StaffScheduleOverrideResponseDto {
    return {
      id: domain.id,
      staffId: domain.staffId,
      date: domain.date,
      overrideType: domain.overrideType,
      branchId: domain.branchId,
      shiftId: domain.shiftId,
      roomId: domain.roomId,
      reason: domain.reason,
      createdAt: domain.createdAt!,
      updatedAt: domain.updatedAt!,
    };
  }
}

@Injectable()
export class RemoveStaffScheduleOverrideUseCase {
  constructor(
    @Inject(IStaffScheduleRepositoryToken)
    private readonly scheduleRepository: IStaffScheduleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const exists = await this.scheduleRepository.findOverrideById(id);
    if (!exists) {
      throw new NotFoundException('Không tìm thấy bản ghi điều chỉnh ngày');
    }
    await this.scheduleRepository.deleteOverride(id);
  }
}

@Injectable()
export class GetStaffSchedulesUseCase {
  constructor(
    @Inject(IStaffScheduleRepositoryToken)
    private readonly scheduleRepository: IStaffScheduleRepository,
    @Inject(IShiftRepositoryToken)
    private readonly shiftRepository: IShiftRepository,
    @InjectRepository(BranchOrmEntity)
    private readonly branchOrmRepository: Repository<BranchOrmEntity>,
    @InjectRepository(RoomOrmEntity)
    private readonly roomOrmRepository: Repository<RoomOrmEntity>,
  ) {}

  async execute(staffIds: string[], startDate: string, endDate: string): Promise<ResolvedScheduleResponseDto[]> {
    if (staffIds.length === 0) return [];

    // 1. Fetch metadata helper lists
    const [shifts, branches, rooms, templates, overrides] = await Promise.all([
      this.shiftRepository.findAll(),
      this.branchOrmRepository.find(),
      this.roomOrmRepository.find(),
      this.scheduleRepository.findTemplatesByStaffs(staffIds),
      this.scheduleRepository.findOverrides(staffIds, startDate, endDate),
    ]);

    const shiftMap = new Map(shifts.map((s) => [s.id, s]));
    const branchMap = new Map(branches.map((b) => [b.id, b]));
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    // 2. Generate list of dates in the range
    const dateList = this.getDatesInRange(startDate, endDate);
    const resolved: ResolvedScheduleResponseDto[] = [];

    for (const staffId of staffIds) {
      // Filter templates & overrides for this staff
      const staffTemplates = templates.filter((t) => t.staffId === staffId);
      const staffOverrides = overrides.filter((o) => o.staffId === staffId);

      for (const dateStr of dateList) {
        const dayOfWeek = this.getUtcDayOfWeek(dateStr);

        // A. Check override
        const dayOverride = staffOverrides.find((o) => o.date === dateStr);
        if (dayOverride) {
          if (dayOverride.overrideType === SCHEDULE_OVERRIDE_TYPE.LEAVE) {
            resolved.push({
              staffId,
              date: dateStr,
              dayOfWeek,
              isLeave: true,
              leaveReason: dayOverride.reason,
              overrideId: dayOverride.id,
              shifts: [],
            });
          } else {
            const shiftInfo = shiftMap.get(dayOverride.shiftId!);
            const branchInfo = branchMap.get(dayOverride.branchId!);
            const shiftsList: ResolvedScheduleShiftDto[] = [];

            if (shiftInfo && branchInfo) {
              const roomInfo = dayOverride.roomId ? roomMap.get(dayOverride.roomId) : null;
              shiftsList.push({
                shiftId: shiftInfo.id,
                shiftName: shiftInfo.name,
                startTime: shiftInfo.startTime,
                endTime: shiftInfo.endTime,
                branchId: branchInfo.id,
                branchName: branchInfo.name,
                roomId: roomInfo ? roomInfo.id : null,
                roomName: roomInfo ? roomInfo.name : null,
              });
            }

            resolved.push({
              staffId,
              date: dateStr,
              dayOfWeek,
              isLeave: false,
              leaveReason: null,
              overrideId: dayOverride.id,
              shifts: shiftsList,
            });
          }
          continue;
        }

        // B. Resolve Template Weekly Schedule
        // Find latest effective_date templates <= dateStr
        const pastTemplates = staffTemplates.filter((t) => t.effectiveDate <= dateStr);
        if (pastTemplates.length === 0) {
          // No schedule template applies yet
          resolved.push({
            staffId,
            date: dateStr,
            dayOfWeek,
            isLeave: false,
            leaveReason: null,
            overrideId: null,
            shifts: [],
          });
          continue;
        }

        // Get max effective date
        const maxEffectiveDate = pastTemplates.reduce((max, t) => {
          return t.effectiveDate > max ? t.effectiveDate : max;
        }, pastTemplates[0].effectiveDate);

        // Filter templates corresponding to that max effective date and day of week
        const activeTemplates = pastTemplates.filter(
          (t) => t.effectiveDate === maxEffectiveDate && t.dayOfWeek === dayOfWeek,
        );

        const shiftList: ResolvedScheduleShiftDto[] = [];
        for (const t of activeTemplates) {
          const shiftInfo = shiftMap.get(t.shiftId);
          const branchInfo = branchMap.get(t.branchId);
          if (shiftInfo && branchInfo) {
            const roomInfo = t.roomId ? roomMap.get(t.roomId) : null;
            shiftList.push({
              shiftId: shiftInfo.id,
              shiftName: shiftInfo.name,
              startTime: shiftInfo.startTime,
              endTime: shiftInfo.endTime,
              branchId: branchInfo.id,
              branchName: branchInfo.name,
              roomId: roomInfo ? roomInfo.id : null,
              roomName: roomInfo ? roomInfo.name : null,
            });
          }
        }

        resolved.push({
          staffId,
          date: dateStr,
          dayOfWeek,
          isLeave: false,
          leaveReason: null,
          overrideId: null,
          shifts: shiftList,
        });
      }
    }

    return resolved;
  }

  // Timezone-safe helper functions
  private getUtcDayOfWeek(dateStr: string): string {
    const parts = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getUTCDay()];
  }

  private getDatesInRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const startParts = startDate.split('-').map(Number);
    const endParts = endDate.split('-').map(Number);

    const start = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
    const end = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));

    const current = new Date(start.getTime());
    while (current <= end) {
      dates.push(current.toISOString().substring(0, 10));
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return dates;
  }
}
