import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { ManagedUserResponseDto } from '../dtos/user-admin.dto';
import { mapManagedUserResponse } from './user-admin.mapper';
import {
  MANAGED_USER_STATUS,
  type ManagedUserStatus,
} from '../../domain/constants/auth.constants';

@Injectable()
export class ListManagedUsersUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(filters?: {
    search?: string;
    roleId?: string;
    status?: ManagedUserStatus;
  }): Promise<ManagedUserResponseDto[]> {
    const query = this.dataSource
      .getRepository(UserOrmEntity)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.defaultBranch', 'defaultBranch')
      .leftJoinAndSelect('user.loginTimeWindow', 'loginTimeWindow')
      .leftJoinAndSelect('user.branchScopes', 'branchScopes')
      .leftJoinAndSelect('branchScopes.branch', 'scopeBranch')
      .orderBy('user.createdAt', 'DESC');

    if (filters?.search) {
      const search = `%${filters.search.toLowerCase()}%`;
      query.andWhere('(LOWER(user.email) LIKE :search OR LOWER(user.username) LIKE :search)', { search });
    }

    if (filters?.roleId) {
      query.andWhere('user.roleId = :roleId', { roleId: filters.roleId });
    }

    if (filters?.status === MANAGED_USER_STATUS.ACTIVE) {
      query.andWhere('user.isActive = true AND user.lockedAt IS NULL');
    }

    if (filters?.status === MANAGED_USER_STATUS.LOCKED) {
      query.andWhere('(user.isActive = false OR user.lockedAt IS NOT NULL)');
    }

    const users = await query.getMany();
    const staffByUserId = await this.getStaffByUserId(users.map((user) => user.id));
    return users.map((user) => mapManagedUserResponse(user, staffByUserId.get(user.id) ?? null));
  }

  private async getStaffByUserId(userIds: string[]): Promise<Map<string, StaffOrmEntity>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const staffList = await this.dataSource.getRepository(StaffOrmEntity).find({
      where: { userId: In(userIds) },
    });

    return new Map(staffList.filter((staff) => staff.userId).map((staff) => [staff.userId as string, staff]));
  }
}
