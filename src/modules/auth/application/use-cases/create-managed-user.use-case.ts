import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchScopeMode } from '../../domain/constants/auth.constants';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { CreateManagedUserDto, ManagedUserResponseDto } from '../dtos/user-admin.dto';
import {
  ensureEmailAvailable,
  ensureRoleExists,
  ensureStaffCanUseAccount,
  ensureUsernameAvailable,
  normalizeBranchScope,
  replaceUserBranchScopes,
  ensureIdentityNumberAvailable,
} from './managed-user-policy';
import { mapManagedUserResponse } from './user-admin.mapper';

@Injectable()
export class CreateManagedUserUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(dto: CreateManagedUserDto): Promise<ManagedUserResponseDto> {
    const staff = await ensureStaffCanUseAccount(this.dataSource, dto.staffId);
    await ensureRoleExists(this.dataSource, dto.roleId);
    await ensureUsernameAvailable(this.dataSource, dto.username);
    await ensureIdentityNumberAvailable(this.dataSource, dto.identityNumber, dto.staffId);

    const email = dto.email || staff.email;
    await ensureEmailAvailable(this.dataSource, email);

    const scope = await normalizeBranchScope(
      this.dataSource,
      dto.defaultBranchId,
      dto.branchScopeMode ?? BranchScopeMode.SPECIFIC,
      dto.branchIds
    );
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userRepository = this.dataSource.getRepository(UserOrmEntity);

    const user = userRepository.create({
      id: randomUUID(),
      email,
      username: dto.username,
      passwordHash,
      roleId: dto.roleId,
      isActive: true,
      defaultBranchId: dto.defaultBranchId,
      branchScopeMode: scope.branchScopeMode,
      bypassIpRestriction: dto.bypassIpRestriction ?? true,
      loginTimeWindowId: dto.loginTimeWindowId ?? null,
      failedLoginLimit: dto.failedLoginLimit ?? null,
      failedLoginCount: 0,
    });

    const savedUser = await userRepository.save(user);
    await this.dataSource.getRepository(StaffOrmEntity).update(staff.id, {
      userId: savedUser.id,
      identityNumber: dto.identityNumber,
    });
    await replaceUserBranchScopes(this.dataSource, savedUser.id, scope.branchIds);

    const hydrated = await userRepository.findOneOrFail({
      where: { id: savedUser.id },
      relations: {
        role: true,
        defaultBranch: true,
        loginTimeWindow: true,
        branchScopes: { branch: true },
      },
    });
    return mapManagedUserResponse(hydrated, {
      ...staff,
      userId: savedUser.id,
      identityNumber: dto.identityNumber,
    });
  }
}
