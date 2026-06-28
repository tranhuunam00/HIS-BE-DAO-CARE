import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { BranchScopeMode } from '../../domain/constants/auth.constants';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { ScopedPermissionOrmEntity } from '../../infrastructure/database/scoped-permission.entity';
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

    // Fetch and merge user + role scoped permissions
    const rawPermissions = await this.dataSource.getRepository(ScopedPermissionOrmEntity).find({
      where: [
        { userId: userId },
        { roleId: user.roleId },
      ],
    });

    const permissionKeys = [
      'canView', 'canRead', 'canApprove', 'canConsult', 'canCancelConsult',
      'canEdit', 'canDelete', 'canUpdateHis', 'canShare', 'canStats',
      'canCancelApprove', 'canDeleteSeries', 'canViewHistory',
      'canRegisterPatient', 'canUpdatePatient', 'canDeletePatient', 'canManageAppointment',
      'canCheckIn', 'canPerformExam', 'canOrderServices', 'canPrescribeMedicine',
      'canConcludeExam', 'canExecuteLaboratory', 'canApproveResult', 'canCollectPayment',
      'canRefundPayment', 'canViewFinancialReports', 'canViewClinicalReports', 'canManagePharmacyStock',
      'canDispenseMedicine', 'canManageSchedules', 'canManageHR', 'canConfigureCatalog',
      'canConfigureSystem'
    ];

    const mergedMap = new Map<string, any>();
    for (const perm of rawPermissions) {
      const bId = perm.branchId;
      if (!mergedMap.has(bId)) {
        mergedMap.set(bId, { branchId: bId });
      }
      const existing = mergedMap.get(bId);
      for (const key of permissionKeys) {
        existing[key] = (existing[key] || (perm as any)[key]) === true;
      }
    }
    const scopedPermissions = Array.from(mergedMap.values());

    return {
      ...mapManagedUserResponse(user, staff),
      staff: staff ? {
        id: staff.id,
        fullName: staff.fullName,
        title: staff.title,
        email: staff.email,
        staffCode: staff.staffCode,
        identityNumber: staff.identityNumber,
      } : null,
      allowedBranches: allowedBranches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        code: branch.code,
      })),
      scopedPermissions,
    };
  }
}
