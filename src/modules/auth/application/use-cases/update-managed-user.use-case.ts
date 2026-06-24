import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchScopeMode } from '../../domain/constants/auth.constants';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { ManagedUserResponseDto, UpdateManagedUserDto } from '../dtos/user-admin.dto';
import {
  ensureEmailAvailable,
  ensureRoleExists,
  ensureStaffCanUseAccount,
  ensureUsernameAvailable,
  normalizeBranchScope,
  replaceUserBranchScopes,
} from './managed-user-policy';
import { mapManagedUserResponse } from './user-admin.mapper';

@Injectable()
export class UpdateManagedUserUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(id: string, dto: UpdateManagedUserDto): Promise<ManagedUserResponseDto> {
    const userRepository = this.dataSource.getRepository(UserOrmEntity);
    const user = await userRepository.findOne({
      where: { id },
      relations: { branchScopes: true },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    const currentStaff = await this.dataSource.getRepository(StaffOrmEntity).findOneBy({ userId: id });
    let staff = currentStaff;
    if (dto.staffId && dto.staffId !== currentStaff?.id) {
      staff = await ensureStaffCanUseAccount(this.dataSource, dto.staffId, id);
      if (currentStaff) {
        await this.dataSource.getRepository(StaffOrmEntity).update(currentStaff.id, { userId: null });
      }
      await this.dataSource.getRepository(StaffOrmEntity).update(staff.id, { userId: id });
    }

    if (dto.roleId) {
      await ensureRoleExists(this.dataSource, dto.roleId);
      user.roleId = dto.roleId;
    }

    if (dto.username && dto.username !== user.username) {
      await ensureUsernameAvailable(this.dataSource, dto.username, id);
      user.username = dto.username;
    }

    if (dto.email && dto.email !== user.email) {
      await ensureEmailAvailable(this.dataSource, dto.email, id);
      user.email = dto.email;
    }

    const nextDefaultBranchId = dto.defaultBranchId ?? user.defaultBranchId;
    if (nextDefaultBranchId) {
      const nextScopeMode = dto.branchScopeMode ?? user.branchScopeMode ?? BranchScopeMode.SPECIFIC;
      const nextBranchIds = dto.branchIds ?? user.branchScopes?.map((scope) => scope.branchId) ?? [];
      const scope = await normalizeBranchScope(this.dataSource, nextDefaultBranchId, nextScopeMode, nextBranchIds);
      user.defaultBranchId = nextDefaultBranchId;
      user.branchScopeMode = scope.branchScopeMode;
      await replaceUserBranchScopes(this.dataSource, id, scope.branchIds);
    }

    if (typeof dto.bypassIpRestriction === 'boolean') {
      user.bypassIpRestriction = dto.bypassIpRestriction;
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'loginTimeWindowId')) {
      user.loginTimeWindowId = dto.loginTimeWindowId ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'failedLoginLimit')) {
      user.failedLoginLimit = dto.failedLoginLimit ?? null;
    }

    await userRepository.save(user);

    const hydrated = await userRepository.findOneOrFail({
      where: { id },
      relations: {
        role: true,
        defaultBranch: true,
        loginTimeWindow: true,
        branchScopes: { branch: true },
      },
    });
    const latestStaff = await this.dataSource.getRepository(StaffOrmEntity).findOneBy({ userId: id });
    return mapManagedUserResponse(hydrated, latestStaff ?? staff ?? null);
  }
}
