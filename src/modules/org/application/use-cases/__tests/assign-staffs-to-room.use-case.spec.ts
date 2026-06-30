import { Test, TestingModule } from '@nestjs/testing';
import { AssignStaffsToRoomUseCase } from '../assign-staffs-to-room.use-case';
import { IRoomRepositoryToken } from '../../../domain/repositories/room.repository.interface';
import { IStaffRepositoryToken } from '../../../domain/repositories/staff.repository.interface';
import { IStaffAssignmentRepositoryToken } from '../../../domain/repositories/staff-assignment.repository.interface';
import { Room } from '../../../domain/entities/room.model';
import { Staff } from '../../../domain/entities/staff.model';
import { StaffAssignment } from '../../../domain/entities/staff-assignment.model';
import { NotFoundException } from '@nestjs/common';

describe('AssignStaffsToRoomUseCase', () => {
  let useCase: AssignStaffsToRoomUseCase;

  // Mock databases
  let roomsDb: Map<string, Room> = new Map();
  let staffDb: Map<string, Staff> = new Map();
  let assignmentsDb: Map<string, StaffAssignment> = new Map();

  const mockRoom = new Room(
    'room-1111',
    'branch-1111',
    'Phòng Khám 101',
    'PK101',
    'CLINIC',
    null,
    'Tầng 1',
    1,
    true,
    new Date(),
    new Date(),
    []
  );

  const mockStaff1 = new Staff(
    'staff-1111',
    'BS. Trần Hữu Nam',
    new Date('1990-01-01'),
    'MALE',
    '037090123456',
    '0988777666',
    'namth@daocare.vn',
    'Hà Nội',
    'NV0001',
    new Date('2026-01-01'),
    'DOCTOR',
    true,
    true,
    null,
    new Date(),
    new Date()
  );

  const mockStaff2 = new Staff(
    'staff-2222',
    'BS. Nguyễn Văn A',
    new Date('1992-02-02'),
    'MALE',
    '037092123456',
    '0988777555',
    'anv@daocare.vn',
    'Hà Nội',
    'NV0002',
    new Date('2026-01-02'),
    'DOCTOR',
    true,
    true,
    null,
    new Date(),
    new Date()
  );

  // Mock repos
  const mockRoomRepository = {
    findById: jest.fn(async (id: string) => roomsDb.get(id) || null),
  };

  const mockStaffRepository = {
    findAll: jest.fn(async (filters?: { roomId?: string }) => {
      let list = Array.from(staffDb.values());
      if (filters?.roomId) {
        list = list.filter((s) => {
          const assigns = Array.from(assignmentsDb.values()).filter((a) => a.staffId === s.id);
          return assigns.some((a) => a.roomId === filters.roomId);
        });
      }
      return list;
    }),
    findById: jest.fn(async (id: string) => staffDb.get(id) || null),
  };

  const mockStaffAssignmentRepository = {
    findByStaffId: jest.fn(async (staffId: string) => {
      return Array.from(assignmentsDb.values()).filter((a) => a.staffId === staffId);
    }),
    save: jest.fn(async (assignment: StaffAssignment) => {
      assignmentsDb.set(assignment.id, assignment);
      return assignment;
    }),
  };

  beforeEach(async () => {
    roomsDb.clear();
    staffDb.clear();
    assignmentsDb.clear();

    roomsDb.set(mockRoom.id, mockRoom);
    staffDb.set(mockStaff1.id, mockStaff1);
    staffDb.set(mockStaff2.id, mockStaff2);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignStaffsToRoomUseCase,
        {
          provide: IRoomRepositoryToken,
          useValue: mockRoomRepository,
        },
        {
          provide: IStaffRepositoryToken,
          useValue: mockStaffRepository,
        },
        {
          provide: IStaffAssignmentRepositoryToken,
          useValue: mockStaffAssignmentRepository,
        },
      ],
    }).compile();

    useCase = module.get<AssignStaffsToRoomUseCase>(AssignStaffsToRoomUseCase);
  });

  it('should assign multiple staff to room', async () => {
    // Initially, no assignments
    expect(assignmentsDb.size).toBe(0);

    // Execute batch assignment for staff-1111 and staff-2222 to room-1111
    await useCase.execute('room-1111', ['staff-1111', 'staff-2222']);

    // Check assignments
    const currentAssignments = Array.from(assignmentsDb.values());
    expect(currentAssignments.length).toBe(2);

    const assign1 = currentAssignments.find((a) => a.staffId === 'staff-1111');
    expect(assign1).toBeDefined();
    expect(assign1?.roomId).toBe('room-1111');
    expect(assign1?.branchId).toBe('branch-1111');

    const assign2 = currentAssignments.find((a) => a.staffId === 'staff-2222');
    expect(assign2).toBeDefined();
    expect(assign2?.roomId).toBe('room-1111');
  });

  it('should clear room assignments for staff not in new list', async () => {
    // Setup initial assignments
    // staff1 is assigned to room-1111
    const assign1 = new StaffAssignment('assign-1', 'staff-1111', 'branch-1111', null, 'room-1111', true, new Date(), new Date());
    assignmentsDb.set(assign1.id, assign1);

    // staff2 is assigned to room-1111
    const assign2 = new StaffAssignment('assign-2', 'staff-2222', 'branch-1111', null, 'room-1111', false, new Date(), new Date());
    assignmentsDb.set(assign2.id, assign2);

    // Assign only staff2 to room-1111, which should clear staff1
    await useCase.execute('room-1111', ['staff-2222']);

    const currentAssignments = Array.from(assignmentsDb.values());
    const staff1Assign = currentAssignments.find((a) => a.staffId === 'staff-1111');
    expect(staff1Assign?.roomId).toBeNull(); // should be cleared

    const staff2Assign = currentAssignments.find((a) => a.staffId === 'staff-2222');
    expect(staff2Assign?.roomId).toBe('room-1111'); // should keep assignment
  });

  it('should throw NotFoundException if room does not exist', async () => {
    await expect(useCase.execute('invalid-room-id', ['staff-1111'])).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw NotFoundException if staff does not exist', async () => {
    await expect(useCase.execute('room-1111', ['invalid-staff-id'])).rejects.toThrow(
      NotFoundException
    );
  });
});
