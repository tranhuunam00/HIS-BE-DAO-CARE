import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, In, Not } from 'typeorm';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchScopeMode } from '../../domain/constants/auth.constants';
import { RoleOrmEntity } from '../../infrastructure/database/role.entity';
import { UserBranchScopeOrmEntity } from '../../infrastructure/database/user-branch-scope.entity';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';

export async function ensureRoleExists(dataSource: DataSource, roleId: string): Promise<RoleOrmEntity> {
  const role = await dataSource.getRepository(RoleOrmEntity).findOneBy({ id: roleId });
  if (!role) {
    throw new NotFoundException('Không tìm thấy nhóm user');
  }
  return role;
}

export async function ensureStaffCanUseAccount(
  dataSource: DataSource,
  staffId: string,
  userId?: string
): Promise<StaffOrmEntity> {
  const staff = await dataSource.getRepository(StaffOrmEntity).findOneBy({ id: staffId });
  if (!staff) {
    throw new NotFoundException('Không tìm thấy nhân viên');
  }

  if (staff.userId && staff.userId !== userId) {
    throw new ConflictException('Nhân viên này đã được gán tài khoản khác');
  }

  return staff;
}

export async function ensureUsernameAvailable(
  dataSource: DataSource,
  username: string,
  userId?: string
): Promise<void> {
  const where = userId ? { username, id: Not(userId) } : { username };
  const existing = await dataSource.getRepository(UserOrmEntity).findOne({ where });
  if (existing) {
    throw new ConflictException('Tên đăng nhập đã được sử dụng');
  }
}

export async function ensureEmailAvailable(
  dataSource: DataSource,
  email: string,
  userId?: string
): Promise<void> {
  const where = userId ? { email, id: Not(userId) } : { email };
  const existing = await dataSource.getRepository(UserOrmEntity).findOne({ where });
  if (existing) {
    throw new ConflictException('Email đã được sử dụng');
  }
}

export async function normalizeBranchScope(
  dataSource: DataSource,
  defaultBranchId: string,
  branchScopeMode: BranchScopeMode | string,
  branchIds?: string[]
): Promise<{ branchScopeMode: BranchScopeMode; branchIds: string[] }> {
  const mode = branchScopeMode === BranchScopeMode.ALL ? BranchScopeMode.ALL : BranchScopeMode.SPECIFIC;
  const defaultBranch = await dataSource.getRepository(BranchOrmEntity).findOneBy({ id: defaultBranchId });
  if (!defaultBranch) {
    throw new NotFoundException('Không tìm thấy chi nhánh mặc định');
  }

  const uniqueBranchIds = Array.from(new Set([...(branchIds ?? []), defaultBranchId]));
  if (mode === BranchScopeMode.ALL) {
    return { branchScopeMode: mode, branchIds: uniqueBranchIds };
  }

  if (uniqueBranchIds.length === 0) {
    throw new BadRequestException('Phạm vi chi nhánh phải có ít nhất một chi nhánh');
  }

  const existingBranches = await dataSource.getRepository(BranchOrmEntity).find({
    where: { id: In(uniqueBranchIds) },
  });
  if (existingBranches.length !== uniqueBranchIds.length) {
    throw new NotFoundException('Danh sách phạm vi chi nhánh có chi nhánh không tồn tại');
  }

  if (!uniqueBranchIds.includes(defaultBranchId)) {
    throw new BadRequestException('Chi nhánh mặc định phải nằm trong phạm vi chi nhánh sử dụng');
  }

  return { branchScopeMode: mode, branchIds: uniqueBranchIds };
}

export async function replaceUserBranchScopes(
  dataSource: DataSource,
  userId: string,
  branchIds: string[]
): Promise<void> {
  const scopeRepository = dataSource.getRepository(UserBranchScopeOrmEntity);
  await scopeRepository.delete({ userId });
  if (branchIds.length === 0) {
    return;
  }

  await scopeRepository.save(branchIds.map((branchId) => scopeRepository.create({ userId, branchId })));
}
