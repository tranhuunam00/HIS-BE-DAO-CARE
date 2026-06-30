import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IStaffScheduleRepositoryToken } from '../../../domain/repositories/staff-schedule.repository.interface';
import { IShiftRepositoryToken } from '../../../domain/repositories/shift.repository.interface';
import { StaffScheduleTemplate } from '../../../domain/entities/staff-schedule-template.model';
import { StaffScheduleOverride } from '../../../domain/entities/staff-schedule-override.model';
import { Shift } from '../../../domain/entities/shift.model';
import { BranchOrmEntity } from '../../../../org/infrastructure/database/branch.entity';
import { StaffOrmEntity } from '../../../../org/infrastructure/database/staff.entity';
import { RoomOrmEntity } from '../../../../org/infrastructure/database/room.entity';
import { StaffAssignmentOrmEntity } from '../../../../org/infrastructure/database/staff-assignment.entity';
import {
  UpdateStaffScheduleTemplateUseCase,
  CreateStaffScheduleOverrideUseCase,
  RemoveStaffScheduleOverrideUseCase,
  GetStaffSchedulesUseCase,
} from '../staff-schedule.use-cases';

describe('StaffScheduleUseCases', () => {
  let updateTemplateUseCase: UpdateStaffScheduleTemplateUseCase;
  let createOverrideUseCase: CreateStaffScheduleOverrideUseCase;
  let removeOverrideUseCase: RemoveStaffScheduleOverrideUseCase;
  let getSchedulesUseCase: GetStaffSchedulesUseCase;

  // Mock data
  const mockShifts: Shift[] = [
    new Shift('shift-1', 'Ca sáng', '08:00', '12:00', true),
    new Shift('shift-2', 'Ca chiều', '13:30', '17:30', true),
  ];

  const mockBranches = [
    { id: 'branch-1', name: 'Chi nhánh Quận 1' },
    { id: 'branch-2', name: 'Chi nhánh Quận 3' },
  ];

  const mockStaffList = [
    { id: 'staff-1', fullName: 'BS. Nguyễn Văn A' },
    { id: 'staff-2', fullName: 'BS. Trần Văn B' },
  ];

  // In-memory repositories
  let templatesDb: StaffScheduleTemplate[] = [];
  let overridesDb: StaffScheduleOverride[] = [];

  const mockStaffScheduleRepository = {
    findTemplatesByStaffs: jest.fn().mockImplementation((staffIds: string[]) => {
      return Promise.resolve(templatesDb.filter((t) => staffIds.includes(t.staffId)));
    }),
    saveTemplates: jest.fn().mockImplementation((templates: StaffScheduleTemplate[]) => {
      const saved = templates.map((t) => {
        return new StaffScheduleTemplate(
          t.id || `template-${Date.now()}-${Math.random()}`,
          t.staffId,
          t.branchId,
          t.dayOfWeek,
          t.shiftId,
          t.effectiveDate,
          t.roomId || null,
          new Date(),
          new Date(),
        );
      });
      templatesDb.push(...saved);
      return Promise.resolve(saved);
    }),
    deleteTemplatesByStaffAndEffectiveDate: jest.fn().mockImplementation((staffIds: string[], effectiveDate: string) => {
      templatesDb = templatesDb.filter(
        (t) => !(staffIds.includes(t.staffId) && t.effectiveDate === effectiveDate),
      );
      return Promise.resolve();
    }),
    findOverrides: jest.fn().mockImplementation((staffIds: string[], startDate: string, endDate: string) => {
      return Promise.resolve(
        overridesDb.filter((o) => staffIds.includes(o.staffId) && o.date >= startDate && o.date <= endDate),
      );
    }),
    findOverrideById: jest.fn().mockImplementation((id: string) => {
      const o = overridesDb.find((item) => item.id === id);
      return Promise.resolve(o || null);
    }),
    saveOverride: jest.fn().mockImplementation((override: StaffScheduleOverride) => {
      const saved = new StaffScheduleOverride(
        override.id || `override-${Date.now()}`,
        override.staffId,
        override.date,
        override.overrideType,
        override.branchId,
        override.shiftId,
        override.reason,
        override.roomId || null,
        new Date(),
        new Date(),
      );
      overridesDb.push(saved);
      return Promise.resolve(saved);
    }),
    deleteOverride: jest.fn().mockImplementation((id: string) => {
      overridesDb = overridesDb.filter((o) => o.id !== id);
      return Promise.resolve();
    }),
  };

  const mockShiftRepository = {
    findAll: jest.fn().mockResolvedValue(mockShifts),
    findById: jest.fn().mockImplementation((id: string) => {
      const s = mockShifts.find((item) => item.id === id);
      return Promise.resolve(s || null);
    }),
  };

  const mockBranchOrmRepository = {
    find: jest.fn().mockResolvedValue(mockBranches),
    findOne: jest.fn().mockImplementation((opts: any) => {
      const b = mockBranches.find((item) => item.id === opts.where.id);
      return Promise.resolve(b || null);
    }),
  };

  const mockStaffOrmRepository = {
    findOne: jest.fn().mockImplementation((opts: any) => {
      const s = mockStaffList.find((item) => item.id === opts.where.id);
      return Promise.resolve(s || null);
    }),
  };

  const mockRooms = [
    { id: 'room-1', name: 'Phòng khám 1', branchId: 'branch-1' },
    { id: 'room-2', name: 'Phòng khám 2', branchId: 'branch-1' },
  ];

  const mockRoomOrmRepository = {
    find: jest.fn().mockResolvedValue(mockRooms),
    findOne: jest.fn().mockImplementation((opts: any) => {
      const r = mockRooms.find((item) => item.id === opts.where.id);
      return Promise.resolve(r || null);
    }),
  };

  const mockStaffAssignments = [
    { id: 'assign-1', staffId: 'staff-1', branchId: 'branch-1', roomId: 'room-1', isPrimary: true },
    { id: 'assign-2', staffId: 'staff-2', branchId: 'branch-1', roomId: 'room-2', isPrimary: true },
  ];

  const mockStaffAssignmentRepository = {
    find: jest.fn().mockImplementation((opts: any) => {
      const filtered = mockStaffAssignments.filter(a => a.staffId === opts.where.staffId);
      return Promise.resolve(filtered);
    }),
  };

  beforeEach(async () => {
    templatesDb = [];
    overridesDb = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStaffScheduleTemplateUseCase,
        CreateStaffScheduleOverrideUseCase,
        RemoveStaffScheduleOverrideUseCase,
        GetStaffSchedulesUseCase,
        {
          provide: IStaffScheduleRepositoryToken,
          useValue: mockStaffScheduleRepository,
        },
        {
          provide: IShiftRepositoryToken,
          useValue: mockShiftRepository,
        },
        {
          provide: getRepositoryToken(BranchOrmEntity),
          useValue: mockBranchOrmRepository,
        },
        {
          provide: getRepositoryToken(StaffOrmEntity),
          useValue: mockStaffOrmRepository,
        },
        {
          provide: getRepositoryToken(RoomOrmEntity),
          useValue: mockRoomOrmRepository,
        },
        {
          provide: getRepositoryToken(StaffAssignmentOrmEntity),
          useValue: mockStaffAssignmentRepository,
        },
      ],
    }).compile();

    updateTemplateUseCase = module.get<UpdateStaffScheduleTemplateUseCase>(UpdateStaffScheduleTemplateUseCase);
    createOverrideUseCase = module.get<CreateStaffScheduleOverrideUseCase>(CreateStaffScheduleOverrideUseCase);
    removeOverrideUseCase = module.get<RemoveStaffScheduleOverrideUseCase>(RemoveStaffScheduleOverrideUseCase);
    getSchedulesUseCase = module.get<GetStaffSchedulesUseCase>(GetStaffSchedulesUseCase);

    jest.clearAllMocks();
  });

  describe('UpdateStaffScheduleTemplateUseCase', () => {
    it('should successfully update template schedules', async () => {
      const dto = {
        staffIds: ['staff-1'],
        effectiveDate: '2026-06-29',
        items: [
          { branchId: 'branch-1', dayOfWeek: 'Monday', shiftId: 'shift-1' },
          { branchId: 'branch-1', dayOfWeek: 'Tuesday', shiftId: 'shift-2' },
        ],
      };

      await updateTemplateUseCase.execute(dto);
      expect(templatesDb).toHaveLength(2);
      expect(templatesDb[0].staffId).toBe('staff-1');
      expect(templatesDb[0].dayOfWeek).toBe('Monday');
    });

    it('should throw NotFoundException if staff does not exist', async () => {
      const dto = {
        staffIds: ['invalid-staff'],
        effectiveDate: '2026-06-29',
        items: [],
      };
      await expect(updateTemplateUseCase.execute(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if shift does not exist', async () => {
      const dto = {
        staffIds: ['staff-1'],
        effectiveDate: '2026-06-29',
        items: [{ branchId: 'branch-1', dayOfWeek: 'Monday', shiftId: 'invalid-shift' }],
      };
      await expect(updateTemplateUseCase.execute(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateStaffScheduleOverrideUseCase', () => {
    it('should successfully create a LEAVE override', async () => {
      const dto = {
        staffId: 'staff-1',
        date: '2026-06-24',
        overrideType: 'LEAVE',
        reason: 'Nghỉ phép năm',
      };

      const result = await createOverrideUseCase.execute(dto);
      expect(result.overrideType).toBe('LEAVE');
      expect(result.reason).toBe('Nghỉ phép năm');
      expect(overridesDb).toHaveLength(1);
    });

    it('should successfully create a WORK override and clear previous overrides on same day', async () => {
      // First save a leave override
      overridesDb.push(new StaffScheduleOverride('old-id', 'staff-1', '2026-06-24', 'LEAVE', null, null, 'Old leave'));

      const dto = {
        staffId: 'staff-1',
        date: '2026-06-24',
        overrideType: 'WORK',
        branchId: 'branch-1',
        shiftId: 'shift-1',
      };

      const result = await createOverrideUseCase.execute(dto);
      expect(result.overrideType).toBe('WORK');
      expect(result.branchId).toBe('branch-1');
      expect(result.shiftId).toBe('shift-1');
      expect(overridesDb).toHaveLength(1); // Old override deleted, new one created
      expect(overridesDb[0].id).not.toBe('old-id');
    });

    it('should throw BadRequestException if WORK override lacks shiftId or branchId', async () => {
      const dto = {
        staffId: 'staff-1',
        date: '2026-06-24',
        overrideType: 'WORK',
      };
      await expect(createOverrideUseCase.execute(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('RemoveStaffScheduleOverrideUseCase', () => {
    it('should successfully delete an override', async () => {
      overridesDb.push(new StaffScheduleOverride('override-id', 'staff-1', '2026-06-24', 'LEAVE', null, null, 'Leave'));
      expect(overridesDb).toHaveLength(1);

      await removeOverrideUseCase.execute('override-id');
      expect(overridesDb).toHaveLength(0);
    });

    it('should throw NotFoundException if override does not exist', async () => {
      await expect(removeOverrideUseCase.execute('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GetStaffSchedulesUseCase', () => {
    it('should successfully resolve schedule with templates and overrides', async () => {
      // 1. Set up templates
      // Monday 2026-06-22 template
      templatesDb.push(
        new StaffScheduleTemplate('t-1', 'staff-1', 'branch-1', 'Monday', 'shift-1', '2026-06-22'),
      );
      // Tuesday template
      templatesDb.push(
        new StaffScheduleTemplate('t-2', 'staff-1', 'branch-1', 'Tuesday', 'shift-2', '2026-06-22'),
      );
      // Wednesday template starting 2026-06-24 (Wednesday)
      templatesDb.push(
        new StaffScheduleTemplate('t-3', 'staff-1', 'branch-2', 'Wednesday', 'shift-1', '2026-06-24'),
      );

      // 2. Set up overrides
      // Monday 2026-06-22 is overridden with LEAVE
      overridesDb.push(
        new StaffScheduleOverride('o-1', 'staff-1', '2026-06-22', 'LEAVE', null, null, 'Sick Leave'),
      );

      // Fetch schedule for staff-1 from 2026-06-22 (Mon) to 2026-06-24 (Wed)
      const result = await getSchedulesUseCase.execute(['staff-1'], '2026-06-22', '2026-06-24');

      expect(result).toHaveLength(3);

      // Day 1: 2026-06-22 (Monday) -> LEAVE override applied
      expect(result[0].date).toBe('2026-06-22');
      expect(result[0].isLeave).toBe(true);
      expect(result[0].leaveReason).toBe('Sick Leave');
      expect(result[0].shifts).toHaveLength(0);

      // Day 2: 2026-06-23 (Tuesday) -> Template applied
      expect(result[1].date).toBe('2026-06-23');
      expect(result[1].isLeave).toBe(false);
      expect(result[1].shifts).toHaveLength(1);
      expect(result[1].shifts[0].shiftId).toBe('shift-2');
      expect(result[1].shifts[0].branchId).toBe('branch-1');

      // Day 3: 2026-06-24 (Wednesday) -> Template starting on 2026-06-24 applied
      expect(result[2].date).toBe('2026-06-24');
      expect(result[2].isLeave).toBe(false);
      expect(result[2].shifts).toHaveLength(1);
      expect(result[2].shifts[0].shiftId).toBe('shift-1');
      expect(result[2].shifts[0].branchId).toBe('branch-2'); // checks template change update
    });
  });
});
