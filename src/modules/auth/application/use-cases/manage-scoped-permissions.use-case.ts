import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ScopedPermissionOrmEntity } from '../../infrastructure/database/scoped-permission.entity';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { RoleOrmEntity } from '../../infrastructure/database/role.entity';
import { BranchOrmEntity } from '../../../../modules/org/infrastructure/database/branch.entity';
import { SaveRoleScopedPermissionDto, SaveUserCustomPermissionDto } from '../dtos/scoped-permission.dto';
import * as crypto from 'crypto';

@Injectable()
export class ListUserScopedPermissionsUseCase {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(ScopedPermissionOrmEntity)
    private readonly scopedPermissionRepository: Repository<ScopedPermissionOrmEntity>,
    @InjectRepository(BranchOrmEntity)
    private readonly branchRepository: Repository<BranchOrmEntity>,
  ) {}

  async execute(): Promise<any[]> {
    // 1. Fetch active staff users
    const users = await this.userRepository.find({
      relations: { role: true },
      order: { username: 'ASC' },
    });

    const staffUsers = users.filter((u) => u.role?.name !== 'PATIENT');

    // 2. Fetch all scoped permissions
    const permissions = await this.scopedPermissionRepository.find();

    // 3. Fetch all branches
    const branches = await this.branchRepository.find();
    const branchMap = new Map(branches.map((b) => [b.id, b.name]));

    const result = [];

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

    for (const user of staffUsers) {
      const userRoleId = user.roleId;
      const userId = user.id;

      // Find role permissions
      const rolePerms = permissions.filter((p) => p.roleId === userRoleId);
      // Find user custom permissions
      const userPerms = permissions.filter((p) => p.userId === userId);

      // Find all unique branchIds across role and user
      const branchIds = new Set<string>();

      for (const rp of rolePerms) {
        branchIds.add(rp.branchId);
      }

      for (const up of userPerms) {
        branchIds.add(up.branchId);
      }

      const mergedPermissions = [];

      for (const branchId of branchIds) {
        const matchingRolePerm = rolePerms.find((p) => p.branchId === branchId);
        const matchingUserPerm = userPerms.find((p) => p.branchId === branchId);

        const permObj: any = {
          id: matchingUserPerm?.id || matchingRolePerm?.id || crypto.randomUUID(),
          branchId,
          branchName: branchMap.get(branchId) || 'Chi nhánh không xác định',
          isCustomOnly: !matchingRolePerm && !!matchingUserPerm,
        };

        for (const k of permissionKeys) {
          const roleVal = matchingRolePerm ? !!(matchingRolePerm as any)[k] : false;
          const userVal = matchingUserPerm ? !!(matchingUserPerm as any)[k] : false;

          permObj[k] = roleVal || userVal;
          permObj[`${k}Inherited`] = roleVal;
        }

        mergedPermissions.push(permObj);
      }

      result.push({
        userId: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role?.name || 'No Role',
        permissions: mergedPermissions,
      });
    }

    return result;
  }
}

@Injectable()
export class ListRoleScopedPermissionsUseCase {
  constructor(
    @InjectRepository(ScopedPermissionOrmEntity)
    private readonly scopedPermissionRepository: Repository<ScopedPermissionOrmEntity>,
    @InjectRepository(BranchOrmEntity)
    private readonly branchRepository: Repository<BranchOrmEntity>,
  ) {}

  async execute(roleId: string): Promise<any[]> {
    const permissions = await this.scopedPermissionRepository.find({
      where: { roleId, userId: IsNull() },
    });

    const branches = await this.branchRepository.find();
    const branchMap = new Map(branches.map((b) => [b.id, b.name]));

    return permissions.map((p) => ({
      id: p.id,
      roleId: p.roleId,
      branchId: p.branchId,
      branchName: branchMap.get(p.branchId) || 'Chi nhánh không xác định',
      canView: p.canView,
      canRead: p.canRead,
      canApprove: p.canApprove,
      canConsult: p.canConsult,
      canCancelConsult: p.canCancelConsult,
      canEdit: p.canEdit,
      canDelete: p.canDelete,
      canUpdateHis: p.canUpdateHis,
      canShare: p.canShare,
      canStats: p.canStats,
      canCancelApprove: p.canCancelApprove,
      canDeleteSeries: p.canDeleteSeries,
      canViewHistory: p.canViewHistory,
      canRegisterPatient: p.canRegisterPatient,
      canUpdatePatient: p.canUpdatePatient,
      canDeletePatient: p.canDeletePatient,
      canManageAppointment: p.canManageAppointment,
      canCheckIn: p.canCheckIn,
      canPerformExam: p.canPerformExam,
      canOrderServices: p.canOrderServices,
      canPrescribeMedicine: p.canPrescribeMedicine,
      canConcludeExam: p.canConcludeExam,
      canExecuteLaboratory: p.canExecuteLaboratory,
      canApproveResult: p.canApproveResult,
      canCollectPayment: p.canCollectPayment,
      canRefundPayment: p.canRefundPayment,
      canViewFinancialReports: p.canViewFinancialReports,
      canViewClinicalReports: p.canViewClinicalReports,
      canManagePharmacyStock: p.canManagePharmacyStock,
      canDispenseMedicine: p.canDispenseMedicine,
      canManageSchedules: p.canManageSchedules,
      canManageHR: p.canManageHR,
      canConfigureCatalog: p.canConfigureCatalog,
      canConfigureSystem: p.canConfigureSystem,
    }));
  }
}

@Injectable()
export class SaveRoleScopedPermissionsUseCase {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepository: Repository<RoleOrmEntity>,
    @InjectRepository(ScopedPermissionOrmEntity)
    private readonly scopedPermissionRepository: Repository<ScopedPermissionOrmEntity>,
  ) {}

  async execute(roleId: string, dto: SaveRoleScopedPermissionDto): Promise<ScopedPermissionOrmEntity> {
    const role = await this.roleRepository.findOneBy({ id: roleId });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy vai trò với ID "${roleId}"`);
    }

    // Check if configuration already exists
    let permission = await this.scopedPermissionRepository.findOne({
      where: {
        roleId,
        branchId: dto.branchId,
      },
    });

    if (!permission) {
      permission = this.scopedPermissionRepository.create({
        roleId,
        branchId: dto.branchId,
      });
    }

    // Update permission checkbox values
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

    for (const k of permissionKeys) {
      if ((dto as any)[k] !== undefined) {
        (permission as any)[k] = !!(dto as any)[k];
      }
    }

    return await this.scopedPermissionRepository.save(permission);
  }
}

@Injectable()
export class SaveUserCustomPermissionsUseCase {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(ScopedPermissionOrmEntity)
    private readonly scopedPermissionRepository: Repository<ScopedPermissionOrmEntity>,
  ) {}

  async execute(userId: string, dto: SaveUserCustomPermissionDto): Promise<ScopedPermissionOrmEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy tài khoản với ID "${userId}"`);
    }

    // Check if configuration already exists
    let permission = await this.scopedPermissionRepository.findOne({
      where: {
        userId,
        branchId: dto.branchId,
      },
    });

    if (!permission) {
      permission = this.scopedPermissionRepository.create({
        userId,
        branchId: dto.branchId,
      });
    }

    // Update permission checkbox values
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

    for (const k of permissionKeys) {
      if ((dto as any)[k] !== undefined) {
        (permission as any)[k] = !!(dto as any)[k];
      }
    }

    return await this.scopedPermissionRepository.save(permission);
  }
}

@Injectable()
export class DeleteScopedPermissionUseCase {
  constructor(
    @InjectRepository(ScopedPermissionOrmEntity)
    private readonly scopedPermissionRepository: Repository<ScopedPermissionOrmEntity>,
  ) {}

  async execute(id: string): Promise<void> {
    const permission = await this.scopedPermissionRepository.findOneBy({ id });
    if (permission) {
      await this.scopedPermissionRepository.remove(permission);
    }
  }
}
