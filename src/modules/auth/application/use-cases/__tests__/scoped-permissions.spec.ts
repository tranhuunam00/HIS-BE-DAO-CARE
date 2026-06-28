import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ListUserScopedPermissionsUseCase,
  SaveRoleScopedPermissionsUseCase,
  SaveUserCustomPermissionsUseCase,
  DeleteScopedPermissionUseCase
} from '../manage-scoped-permissions.use-case';
import { ScopedPermissionOrmEntity } from '../../../infrastructure/database/scoped-permission.entity';
import { UserOrmEntity } from '../../../infrastructure/database/user.entity';
import { RoleOrmEntity } from '../../../infrastructure/database/role.entity';
import { BranchOrmEntity } from '../../../../../modules/org/infrastructure/database/branch.entity';
import { NotFoundException } from '@nestjs/common';

describe('Scoped Permissions Use Cases (Branch-only Scope)', () => {
  let listUseCase: ListUserScopedPermissionsUseCase;
  let saveRoleUseCase: SaveRoleScopedPermissionsUseCase;
  let saveUserUseCase: SaveUserCustomPermissionsUseCase;
  let deleteUseCase: DeleteScopedPermissionUseCase;

  let usersDb: any[] = [];
  let rolesDb: any[] = [];
  let branchesDb: any[] = [];
  let permissionsDb: any[] = [];

  const mockUserRepository = {
    find: jest.fn(async () => usersDb),
    findOneBy: jest.fn(async (cond) => usersDb.find((u) => u.id === cond.id) || null),
  };

  const mockRoleRepository = {
    findOneBy: jest.fn(async (cond) => rolesDb.find((r) => r.id === cond.id) || null),
  };

  const mockBranchRepository = {
    find: jest.fn(async () => branchesDb),
  };

  const mockPermissionRepository = {
    find: jest.fn(async () => permissionsDb),
    findOne: jest.fn(async (cond) => {
      const { roleId, userId, branchId } = cond.where;
      return permissionsDb.find((p) => {
        return (
          p.branchId === branchId &&
          (roleId ? p.roleId === roleId : p.userId === userId)
        );
      }) || null;
    }),
    findOneBy: jest.fn(async (cond) => permissionsDb.find((p) => p.id === cond.id) || null),
    create: jest.fn((data) => ({ id: `new-uuid-${Math.random()}`, ...data })),
    save: jest.fn(async (entity) => {
      const idx = permissionsDb.findIndex((p) => p.id === entity.id);
      if (idx >= 0) {
        permissionsDb[idx] = { ...permissionsDb[idx], ...entity };
        return permissionsDb[idx];
      }
      permissionsDb.push(entity);
      return entity;
    }),
    remove: jest.fn(async (entity) => {
      permissionsDb = permissionsDb.filter((p) => p.id !== entity.id);
    }),
  };

  beforeEach(async () => {
    // Reset DBs
    usersDb = [
      { id: 'user-1', username: 'doctor1', email: 'doctor1@daocare.vn', roleId: 'role-doctor', role: { id: 'role-doctor', name: 'DOCTOR' } },
      { id: 'user-2', username: 'admin1', email: 'admin1@daocare.vn', roleId: 'role-admin', role: { id: 'role-admin', name: 'ADMIN' } },
    ];
    rolesDb = [
      { id: 'role-doctor', name: 'DOCTOR' },
      { id: 'role-admin', name: 'ADMIN' },
    ];
    branchesDb = [
      { id: 'branch-1', name: 'Cơ sở Hà Nội - Hai Bà Trưng' },
    ];
    permissionsDb = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUserScopedPermissionsUseCase,
        SaveRoleScopedPermissionsUseCase,
        SaveUserCustomPermissionsUseCase,
        DeleteScopedPermissionUseCase,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RoleOrmEntity),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(BranchOrmEntity),
          useValue: mockBranchRepository,
        },
        {
          provide: getRepositoryToken(ScopedPermissionOrmEntity),
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    listUseCase = module.get<ListUserScopedPermissionsUseCase>(ListUserScopedPermissionsUseCase);
    saveRoleUseCase = module.get<SaveRoleScopedPermissionsUseCase>(SaveRoleScopedPermissionsUseCase);
    saveUserUseCase = module.get<SaveUserCustomPermissionsUseCase>(SaveUserCustomPermissionsUseCase);
    deleteUseCase = module.get<DeleteScopedPermissionUseCase>(DeleteScopedPermissionUseCase);
  });

  it('saves group role-scoped permissions and inherits them to users of that role', async () => {
    // Save permission for ROLE: DOCTOR
    await saveRoleUseCase.execute('role-doctor', {
      branchId: 'branch-1',
      canView: true,
      canRead: true,
    });

    // List permissions
    const list = await listUseCase.execute();

    // Verify doctor has inherited permissions
    const doctorObj = list.find((u) => u.userId === 'user-1');
    expect(doctorObj).toBeDefined();
    expect(doctorObj.permissions).toHaveLength(1);
    expect(doctorObj.permissions[0].branchId).toBe('branch-1');
    expect(doctorObj.permissions[0].branchName).toBe('Cơ sở Hà Nội - Hai Bà Trưng');
    expect(doctorObj.permissions[0].canView).toBe(true);
    expect(doctorObj.permissions[0].canViewInherited).toBe(true);
    expect(doctorObj.permissions[0].canRead).toBe(true);
    expect(doctorObj.permissions[0].canReadInherited).toBe(true);
    expect(doctorObj.permissions[0].canApprove).toBe(false);
    expect(doctorObj.permissions[0].canApproveInherited).toBe(false);

    // Verify admin has NO permissions (different role)
    const adminObj = list.find((u) => u.userId === 'user-2');
    expect(adminObj).toBeDefined();
    expect(adminObj.permissions).toHaveLength(0);
  });

  it('combines role permissions and user custom permissions using logical OR logic', async () => {
    // 1. Save permission for ROLE: DOCTOR (canView=true, canRead=true)
    await saveRoleUseCase.execute('role-doctor', {
      branchId: 'branch-1',
      canView: true,
      canRead: true,
    });

    // 2. Save custom override for doctor USER-1 (canApprove=true)
    await saveUserUseCase.execute('user-1', {
      branchId: 'branch-1',
      canApprove: true,
    });

    // List permissions
    const list = await listUseCase.execute();
    const doctorObj = list.find((u) => u.userId === 'user-1');

    expect(doctorObj.permissions).toHaveLength(1);
    const perm = doctorObj.permissions[0];
    
    // Total permission (OR logic)
    expect(perm.canView).toBe(true);       // Inherited
    expect(perm.canRead).toBe(true);       // Inherited
    expect(perm.canApprove).toBe(true);    // Custom
    expect(perm.canEdit).toBe(false);      // Unset

    // Inheritance indicators
    expect(perm.canViewInherited).toBe(true);
    expect(perm.canReadInherited).toBe(true);
    expect(perm.canApproveInherited).toBe(false); // Not inherited, explicitly custom
  });

  it('deletes scoped permissions', async () => {
    // Save user permission
    const saved = await saveUserUseCase.execute('user-1', {
      branchId: 'branch-1',
      canView: true,
    });

    expect(permissionsDb).toHaveLength(1);

    // Delete it
    await deleteUseCase.execute(saved.id);

    expect(permissionsDb).toHaveLength(0);
  });

  it('throws NotFoundException when role or user does not exist', async () => {
    await expect(saveRoleUseCase.execute('invalid-role', {
      branchId: 'branch-1',
    })).rejects.toThrow(NotFoundException);

    await expect(saveUserUseCase.execute('invalid-user', {
      branchId: 'branch-1',
    })).rejects.toThrow(NotFoundException);
  });
});
