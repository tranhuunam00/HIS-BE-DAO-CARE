import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoomUseCase } from '../create-room.use-case';
import { UpdateRoomUseCase } from '../update-room.use-case';
import { GetRoomUseCase } from '../get-room.use-case';
import { ListRoomsUseCase } from '../list-rooms.use-case';
import { ToggleRoomStatusUseCase } from '../toggle-room-status.use-case';

import { CreateResourceUseCase } from '../create-resource.use-case';
import { UpdateResourceUseCase } from '../update-resource.use-case';
import { ListResourcesUseCase } from '../list-resources.use-case';
import { ToggleResourceStatusUseCase } from '../toggle-resource-status.use-case';

import { CreateStaffUseCase } from '../create-staff.use-case';
import { UpdateStaffUseCase } from '../update-staff.use-case';
import { GetStaffDetailUseCase } from '../get-staff-detail.use-case';
import { ListStaffUseCase } from '../list-staff.use-case';
import { ToggleStaffStatusUseCase } from '../toggle-staff-status.use-case';
import { UpdateCertificateUseCase } from '../update-certificate.use-case';
import { AssignStaffUseCase } from '../assign-staff.use-case';

import { IRoomRepositoryToken } from '../../../domain/repositories/room.repository.interface';
import { IResourceRepositoryToken } from '../../../domain/repositories/resource.repository.interface';
import { IStaffRepositoryToken } from '../../../domain/repositories/staff.repository.interface';
import { IStaffAssignmentRepositoryToken } from '../../../domain/repositories/staff-assignment.repository.interface';
import { IBranchRepositoryToken } from '../../../domain/repositories/branch.repository.interface';

import { Room } from '../../../domain/entities/room.model';
import { Resource } from '../../../domain/entities/resource.model';
import { Staff } from '../../../domain/entities/staff.model';
import { PracticingCertificate } from '../../../domain/entities/practicing-certificate.model';
import { StaffAssignment } from '../../../domain/entities/staff-assignment.model';
import { Branch } from '../../../domain/entities/branch.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('Rooms, Resources & Staff Use Cases', () => {
  // Use Cases
  let createRoomUseCase: CreateRoomUseCase;
  let updateRoomUseCase: UpdateRoomUseCase;
  let getRoomUseCase: GetRoomUseCase;
  let listRoomsUseCase: ListRoomsUseCase;
  let toggleRoomStatusUseCase: ToggleRoomStatusUseCase;

  let createResourceUseCase: CreateResourceUseCase;
  let updateResourceUseCase: UpdateResourceUseCase;
  let listResourcesUseCase: ListResourcesUseCase;
  let toggleResourceStatusUseCase: ToggleResourceStatusUseCase;

  let createStaffUseCase: CreateStaffUseCase;
  let updateStaffUseCase: UpdateStaffUseCase;
  let getStaffDetailUseCase: GetStaffDetailUseCase;
  let listStaffUseCase: ListStaffUseCase;
  let toggleStaffStatusUseCase: ToggleStaffStatusUseCase;
  let updateCertificateUseCase: UpdateCertificateUseCase;
  let assignStaffUseCase: AssignStaffUseCase;

  // Mock databases
  let branchesDb: Map<string, Branch> = new Map();
  let roomsDb: Map<string, Room> = new Map();
  let resourcesDb: Map<string, Resource> = new Map();
  let staffDb: Map<string, Staff> = new Map();
  let certsDb: Map<string, PracticingCertificate> = new Map();
  let assignmentsDb: Map<string, StaffAssignment> = new Map();

  const mockBranch = Branch.create(
    'branch-1111',
    'org-1111',
    'Chi nhánh Hà Nội',
    'CN_HN',
    'CLINIC'
  );

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

  const mockResource = new Resource(
    'resource-1111',
    'room-1111',
    'Ghế Nha Khoa Số 1',
    'GNK01',
    'CHAIR',
    true,
    new Date(),
    new Date()
  );

  const mockStaff = new Staff(
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
    new Date(),
    null,
    []
  );

  // Mock repos
  const mockBranchRepository = {
    findById: jest.fn(async (id: string) => branchesDb.get(id) || null),
  };

  const mockRoomRepository = {
    findAll: jest.fn(async (branchId?: string) => {
      const all = Array.from(roomsDb.values());
      const filtered = branchId ? all.filter((r) => r.branchId === branchId) : all;
      return filtered.map((r) => {
        return new Room(r.id, r.branchId, r.name, r.code, r.type, r.specialtyId, r.floor, r.isActive, r.createdAt, r.updatedAt);
      });
    }),
    findById: jest.fn(async (id: string) => {
      const r = roomsDb.get(id);
      if (!r) return null;
      return new Room(r.id, r.branchId, r.name, r.code, r.type, r.specialtyId, r.floor, r.isActive, r.createdAt, r.updatedAt);
    }),
    findByCode: jest.fn(async (code: string) => {
      for (const r of roomsDb.values()) {
        if (r.code === code) return r;
      }
      return null;
    }),
    save: jest.fn(async (room: Room) => {
      roomsDb.set(room.id, room);
      return room;
    }),
  };

  const mockResourceRepository = {
    findAll: jest.fn(async (roomId?: string) => {
      const all = Array.from(resourcesDb.values());
      return roomId ? all.filter((r) => r.roomId === roomId) : all;
    }),
    findById: jest.fn(async (id: string) => resourcesDb.get(id) || null),
    findByCode: jest.fn(async (code: string) => {
      for (const r of resourcesDb.values()) {
        if (r.code === code) return r;
      }
      return null;
    }),
    save: jest.fn(async (resource: Resource) => {
      resourcesDb.set(resource.id, resource);
      return resource;
    }),
  };

  const mockStaffRepository = {
    findAll: jest.fn(async (filters?: { branchId?: string; title?: string; isActive?: boolean }) => {
      let list = Array.from(staffDb.values());
      if (filters?.title) {
        list = list.filter((s) => s.title === filters.title);
      }
      if (filters?.isActive !== undefined) {
        list = list.filter((s) => s.isActive === filters.isActive);
      }
      if (filters?.branchId) {
        list = list.filter((s) => {
          const assigns = Array.from(assignmentsDb.values()).filter((a) => a.staffId === s.id);
          return assigns.some((a) => a.branchId === filters.branchId);
        });
      }
      return list.map((s) => {
        const cert = certsDb.get(s.id) || null;
        const assigns = Array.from(assignmentsDb.values()).filter((a) => a.staffId === s.id);
        return new Staff(s.id, s.fullName, s.dateOfBirth, s.gender, s.identityNumber, s.phone, s.email, s.address, s.staffCode, s.joinDate, s.title, s.isClinical, s.isActive, s.userId, s.createdAt, s.updatedAt, cert, assigns);
      });
    }),
    findById: jest.fn(async (id: string) => {
      const s = staffDb.get(id);
      if (!s) return null;
      const cert = Array.from(certsDb.values()).find((c) => c.staffId === s.id) || null;
      const assigns = Array.from(assignmentsDb.values()).filter((a) => a.staffId === s.id);
      return new Staff(s.id, s.fullName, s.dateOfBirth, s.gender, s.identityNumber, s.phone, s.email, s.address, s.staffCode, s.joinDate, s.title, s.isClinical, s.isActive, s.userId, s.createdAt, s.updatedAt, cert, assigns);
    }),
    findByCode: jest.fn(async (code: string) => {
      for (const s of staffDb.values()) {
        if (s.staffCode === code) return s;
      }
      return null;
    }),
    findByEmail: jest.fn(async (email: string) => {
      for (const s of staffDb.values()) {
        if (s.email === email) return s;
      }
      return null;
    }),
    findByIdentityNumber: jest.fn(async (idNum: string) => {
      for (const s of staffDb.values()) {
        if (s.identityNumber === idNum) return s;
      }
      return null;
    }),
    save: jest.fn(async (staff: Staff) => {
      staffDb.set(staff.id, staff);
      return staff;
    }),
    saveCertificate: jest.fn(async (cert: PracticingCertificate) => {
      certsDb.set(cert.staffId, cert);
      return cert;
    }),
  };

  const mockStaffAssignmentRepository = {
    findByStaffId: jest.fn(async (staffId: string) => {
      return Array.from(assignmentsDb.values()).filter((a) => a.staffId === staffId);
    }),
    save: jest.fn(async (assignment: StaffAssignment) => {
      assignmentsDb.set(assignment.id, assignment);
      return assignment;
    }),
    delete: jest.fn(async (id: string) => {
      assignmentsDb.delete(id);
    }),
    clearPrimary: jest.fn(async (staffId: string) => {
      for (const a of assignmentsDb.values()) {
        if (a.staffId === staffId && a.isPrimary) {
          assignmentsDb.set(a.id, new StaffAssignment(a.id, a.staffId, a.branchId, a.specialtyId, a.roomId, false, a.createdAt, a.updatedAt));
        }
      }
    }),
  };

  beforeEach(async () => {
    branchesDb.clear();
    roomsDb.clear();
    resourcesDb.clear();
    staffDb.clear();
    certsDb.clear();
    assignmentsDb.clear();

    branchesDb.set(mockBranch.id, mockBranch);
    roomsDb.set(mockRoom.id, mockRoom);
    resourcesDb.set(mockResource.id, mockResource);
    staffDb.set(mockStaff.id, mockStaff);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoomUseCase,
        UpdateRoomUseCase,
        GetRoomUseCase,
        ListRoomsUseCase,
        ToggleRoomStatusUseCase,
        CreateResourceUseCase,
        UpdateResourceUseCase,
        ListResourcesUseCase,
        ToggleResourceStatusUseCase,
        CreateStaffUseCase,
        UpdateStaffUseCase,
        GetStaffDetailUseCase,
        ListStaffUseCase,
        ToggleStaffStatusUseCase,
        UpdateCertificateUseCase,
        AssignStaffUseCase,
        { provide: IBranchRepositoryToken, useValue: mockBranchRepository },
        { provide: IRoomRepositoryToken, useValue: mockRoomRepository },
        { provide: IResourceRepositoryToken, useValue: mockResourceRepository },
        { provide: IStaffRepositoryToken, useValue: mockStaffRepository },
        { provide: IStaffAssignmentRepositoryToken, useValue: mockStaffAssignmentRepository },
      ],
    }).compile();

    createRoomUseCase = module.get<CreateRoomUseCase>(CreateRoomUseCase);
    updateRoomUseCase = module.get<UpdateRoomUseCase>(UpdateRoomUseCase);
    getRoomUseCase = module.get<GetRoomUseCase>(GetRoomUseCase);
    listRoomsUseCase = module.get<ListRoomsUseCase>(ListRoomsUseCase);
    toggleRoomStatusUseCase = module.get<ToggleRoomStatusUseCase>(ToggleRoomStatusUseCase);

    createResourceUseCase = module.get<CreateResourceUseCase>(CreateResourceUseCase);
    updateResourceUseCase = module.get<UpdateResourceUseCase>(UpdateResourceUseCase);
    listResourcesUseCase = module.get<ListResourcesUseCase>(ListResourcesUseCase);
    toggleResourceStatusUseCase = module.get<ToggleResourceStatusUseCase>(ToggleResourceStatusUseCase);

    createStaffUseCase = module.get<CreateStaffUseCase>(CreateStaffUseCase);
    updateStaffUseCase = module.get<UpdateStaffUseCase>(UpdateStaffUseCase);
    getStaffDetailUseCase = module.get<GetStaffDetailUseCase>(GetStaffDetailUseCase);
    listStaffUseCase = module.get<ListStaffUseCase>(ListStaffUseCase);
    toggleStaffStatusUseCase = module.get<ToggleStaffStatusUseCase>(ToggleStaffStatusUseCase);
    updateCertificateUseCase = module.get<UpdateCertificateUseCase>(UpdateCertificateUseCase);
    assignStaffUseCase = module.get<AssignStaffUseCase>(AssignStaffUseCase);
  });

  describe('Room Use Cases', () => {
    it('should create room successfully', async () => {
      const res = await createRoomUseCase.execute({
        branchId: 'branch-1111',
        name: 'Phòng Khám Răng Hàm Mặt',
        code: 'PK_RHM',
        type: 'CLINIC',
      });
      expect(res).toBeDefined();
      expect(res.name).toBe('Phòng Khám Răng Hàm Mặt');
      expect(res.code).toBe('PK_RHM');
    });

    it('should throw ConflictException on duplicate room code', async () => {
      await expect(
        createRoomUseCase.execute({
          branchId: 'branch-1111',
          name: 'Trùng mã',
          code: 'PK101',
          type: 'CLINIC',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('should list rooms filtered by branchId', async () => {
      const rooms = await listRoomsUseCase.execute('branch-1111');
      expect(rooms.length).toBe(1);
      expect(rooms[0].id).toBe('room-1111');
    });

    it('should toggle room status', async () => {
      const res = await toggleRoomStatusUseCase.execute('room-1111', false);
      expect(res.isActive).toBe(false);
    });
  });

  describe('Resource Use Cases', () => {
    it('should create resource successfully', async () => {
      const res = await createResourceUseCase.execute({
        roomId: 'room-1111',
        name: 'Máy nội soi tai mũi họng',
        code: 'MNS_TMH',
        type: 'EQUIPMENT',
      });
      expect(res.code).toBe('MNS_TMH');
    });

    it('should toggle resource status', async () => {
      const res = await toggleResourceStatusUseCase.execute('resource-1111', false);
      expect(res.isActive).toBe(false);
    });
  });

  describe('Staff Use Cases', () => {
    it('should create staff successfully', async () => {
      const res = await createStaffUseCase.execute({
        fullName: 'BS. Lê Thị B',
        dateOfBirth: '1995-02-15',
        gender: 'FEMALE',
        identityNumber: '037095123456',
        phone: '0988111222',
        email: 'lethi.b@daocare.vn',
        staffCode: 'NV0002',
        joinDate: '2026-03-01',
        title: 'DOCTOR',
        isClinical: true,
      });
      expect(res.staffCode).toBe('NV0002');
      expect(res.fullName).toBe('BS. Lê Thị B');
    });

    it('should update staff details', async () => {
      const res = await updateStaffUseCase.execute('staff-1111', {
        fullName: 'BS. Trần Hữu Nam - Updated',
        phone: '0988123456',
      });
      expect(res.fullName).toBe('BS. Trần Hữu Nam - Updated');
      expect(res.phone).toBe('0988123456');
    });

    it('should update staff practicing certificate', async () => {
      const res = await updateCertificateUseCase.execute('staff-1111', {
        certificateNumber: '98765/BYT-CCHN',
        issuedDate: '2022-01-01',
        issuedBy: 'Sở Y tế Hà Nội',
        scopeOfPractice: 'Đông y',
      });
      expect(res.certificateNumber).toBe('98765/BYT-CCHN');
      expect(res.issuedBy).toBe('Sở Y tế Hà Nội');
    });

    it('should assign staff to branch and room', async () => {
      const res = await assignStaffUseCase.execute('staff-1111', {
        branchId: 'branch-1111',
        roomId: 'room-1111',
        isPrimary: true,
      });
      expect(res.branchId).toBe('branch-1111');
      expect(res.roomId).toBe('room-1111');
      expect(res.isPrimary).toBe(true);
    });
  });
});
