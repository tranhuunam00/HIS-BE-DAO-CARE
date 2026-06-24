import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { BranchScopeMode } from '../../domain/constants/auth.constants';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { mapManagedUserResponse } from './user-admin.mapper';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(userId: string) {
    const user = await this.dataSource.getRepository(UserOrmEntity).findOne({
      where: { id: userId },
      relations: {
        role: true,
        defaultBranch: true,
        loginTimeWindow: true,
        branchScopes: { branch: true },
      },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    const staff = await this.dataSource.getRepository(StaffOrmEntity).findOneBy({ userId });
    const allowedBranches = user.branchScopeMode === BranchScopeMode.ALL
      ? await this.dataSource.getRepository(BranchOrmEntity).find({
          where: { isActive: true },
          order: { name: 'ASC' },
        })
      : (user.branchScopes ?? [])
          .map((scope) => scope.branch)
          .filter((branch): branch is BranchOrmEntity => Boolean(branch?.isActive));

    return {
      ...mapManagedUserResponse(user, staff),
      allowedBranches: allowedBranches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        code: branch.code,
      })),
    };
  }
}
