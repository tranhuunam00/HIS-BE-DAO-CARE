import { Test, TestingModule } from '@nestjs/testing';
import { GetOrganizationUseCase } from '../get-organization.use-case';
import { UpdateOrganizationUseCase } from '../update-organization.use-case';
import { CreateBranchUseCase } from '../create-branch.use-case';
import { UpdateBranchUseCase } from '../update-branch.use-case';
import { ListBranchesUseCase } from '../list-branches.use-case';
import { GetBranchUseCase } from '../get-branch.use-case';
import { DeactivateBranchUseCase } from '../deactivate-branch.use-case';
import { IOrganizationRepositoryToken } from '../../../domain/repositories/organization.repository.interface';
import { IBranchRepositoryToken } from '../../../domain/repositories/branch.repository.interface';
import { Organization } from '../../../domain/entities/organization.model';
import { Branch } from '../../../domain/entities/branch.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('Organization & Branch Use Cases', () => {
  let getOrgUseCase: GetOrganizationUseCase;
  let updateOrgUseCase: UpdateOrganizationUseCase;
  let createBranchUseCase: CreateBranchUseCase;
  let updateBranchUseCase: UpdateBranchUseCase;
  let listBranchesUseCase: ListBranchesUseCase;
  let getBranchUseCase: GetBranchUseCase;
  let deactivateBranchUseCase: DeactivateBranchUseCase;

  const mockOrg = Organization.create(
    'org-uuid-1111',
    'Hệ thống Phòng khám DAO CARE',
    'DAO_CARE',
    'DAO CARE',
    '0102030405',
    'Trần Hữu Nam',
    '19001234',
    'contact@daocare.vn',
    'Số 1 Đại Cồ Việt'
  );

  const mockBranch = Branch.create(
    'branch-uuid-2222',
    'org-uuid-1111',
    'Chi nhánh Hà Nội',
    'CN_HN',
    'CLINIC',
    'BS. Trần Hữu Nam',
    '024777888',
    'hn@daocare.vn',
    'Hà Nội',
    'Hai Bà Trưng',
    'Số 1 Đại Cồ Việt'
  );

  let orgsDb: Map<string, Organization> = new Map();
  let branchesDb: Map<string, Branch> = new Map();

  const mockOrganizationRepository = {
    findDefault: jest.fn(async () => {
      return orgsDb.values().next().value || null;
    }),
    findById: jest.fn(async (id: string) => {
      return orgsDb.get(id) || null;
    }),
    findByCode: jest.fn(async (code: string) => {
      for (const org of orgsDb.values()) {
        if (org.code === code) return org;
      }
      return null;
    }),
    save: jest.fn(async (org: Organization) => {
      orgsDb.set(org.id, org);
      return org;
    }),
  };

  const mockBranchRepository = {
    findAll: jest.fn(async () => {
      return Array.from(branchesDb.values());
    }),
    findById: jest.fn(async (id: string) => {
      return branchesDb.get(id) || null;
    }),
    findByCode: jest.fn(async (code: string) => {
      for (const b of branchesDb.values()) {
        if (b.code === code) return b;
      }
      return null;
    }),
    save: jest.fn(async (branch: Branch) => {
      branchesDb.set(branch.id, branch);
      return branch;
    }),
  };

  beforeEach(async () => {
    orgsDb = new Map();
    branchesDb = new Map();

    orgsDb.set(mockOrg.id, mockOrg);
    branchesDb.set(mockBranch.id, mockBranch);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrganizationUseCase,
        UpdateOrganizationUseCase,
        CreateBranchUseCase,
        UpdateBranchUseCase,
        ListBranchesUseCase,
        GetBranchUseCase,
        DeactivateBranchUseCase,
        {
          provide: IOrganizationRepositoryToken,
          useValue: mockOrganizationRepository,
        },
        {
          provide: IBranchRepositoryToken,
          useValue: mockBranchRepository,
        },
      ],
    }).compile();

    getOrgUseCase = module.get<GetOrganizationUseCase>(GetOrganizationUseCase);
    updateOrgUseCase = module.get<UpdateOrganizationUseCase>(UpdateOrganizationUseCase);
    createBranchUseCase = module.get<CreateBranchUseCase>(CreateBranchUseCase);
    updateBranchUseCase = module.get<UpdateBranchUseCase>(UpdateBranchUseCase);
    listBranchesUseCase = module.get<ListBranchesUseCase>(ListBranchesUseCase);
    getBranchUseCase = module.get<GetBranchUseCase>(GetBranchUseCase);
    deactivateBranchUseCase = module.get<DeactivateBranchUseCase>(DeactivateBranchUseCase);

    jest.clearAllMocks();
  });

  describe('Organization Use Cases', () => {
    it('should retrieve default organization settings', async () => {
      const res = await getOrgUseCase.execute();
      expect(res).toBeDefined();
      expect(res.name).toBe(mockOrg.name);
      expect(res.code).toBe(mockOrg.code);
    });

    it('should throw NotFoundException on getOrg if none exists', async () => {
      orgsDb.clear();
      await expect(getOrgUseCase.execute()).rejects.toThrow(NotFoundException);
    });

    it('should update organization settings successfully', async () => {
      const res = await updateOrgUseCase.execute({
        name: 'Hệ thống DAO CARE Mới',
        shortName: 'DAO CARE NEW',
        otpExpirationTime: 400,
      });

      expect(res.name).toBe('Hệ thống DAO CARE Mới');
      expect(res.shortName).toBe('DAO CARE NEW');
      expect(res.otpExpirationTime).toBe(400);
      expect(mockOrganizationRepository.save).toHaveBeenCalled();
    });
  });

  describe('Branch Use Cases', () => {
    it('should list all branches', async () => {
      const res = await listBranchesUseCase.execute();
      expect(res).toBeDefined();
      expect(res.length).toBe(1);
      expect(res[0].code).toBe(mockBranch.code);
    });

    it('should retrieve branch by ID', async () => {
      const res = await getBranchUseCase.execute(mockBranch.id);
      expect(res).toBeDefined();
      expect(res.name).toBe(mockBranch.name);
    });

    it('should throw NotFoundException on getBranch if ID does not exist', async () => {
      await expect(getBranchUseCase.execute('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should create new branch successfully', async () => {
      const res = await createBranchUseCase.execute({
        name: 'Chi nhánh Sài Gòn',
        code: 'CN_SG',
        type: 'CLINIC',
        technicalDirector: 'BS. Nguyễn Văn A',
      });

      expect(res).toBeDefined();
      expect(res.name).toBe('Chi nhánh Sài Gòn');
      expect(res.code).toBe('CN_SG');
      expect(mockBranchRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if branch code is duplicated', async () => {
      await expect(
        createBranchUseCase.execute({
          name: 'Trùng mã',
          code: 'CN_HN', // Already exists in before-each
        })
      ).rejects.toThrow(ConflictException);
    });

    it('should update branch details successfully', async () => {
      const res = await updateBranchUseCase.execute(mockBranch.id, {
        name: 'Chi nhánh Hà Nội Updated',
        technicalDirector: 'BS. Lê Văn B',
      });

      expect(res.name).toBe('Chi nhánh Hà Nội Updated');
      expect(res.technicalDirector).toBe('BS. Lê Văn B');
      expect(mockBranchRepository.save).toHaveBeenCalled();
    });

    it('should deactivate a branch successfully', async () => {
      const res = await deactivateBranchUseCase.execute(mockBranch.id, false);
      expect(res.isActive).toBe(false);
      expect(mockBranchRepository.save).toHaveBeenCalled();
    });
  });
});
