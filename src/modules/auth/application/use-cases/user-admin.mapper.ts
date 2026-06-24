import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchScopeMode } from '../../domain/constants/auth.constants';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { ManagedUserResponseDto } from '../dtos/user-admin.dto';

export function mapManagedUserResponse(
  user: UserOrmEntity,
  staff: StaffOrmEntity | null
): ManagedUserResponseDto {
  const branchScopeIds = user.branchScopes?.map((scope) => scope.branchId) ?? [];
  const defaultBranchName = user.defaultBranch?.name ?? null;
  const branchScopeLabel = user.branchScopeMode === BranchScopeMode.ALL
    ? 'Tất cả chi nhánh'
    : user.branchScopes?.map((scope) => scope.branch?.name).filter(Boolean).join(', ') || 'Chưa cấu hình';

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    roleId: user.roleId,
    roleName: user.role?.name ?? null,
    staffId: staff?.id ?? null,
    staffCode: staff?.staffCode ?? null,
    staffName: staff?.fullName ?? null,
    staffIdentityNumber: staff?.identityNumber ?? null,
    defaultBranchId: user.defaultBranchId,
    defaultBranchName,
    branchScopeMode: user.branchScopeMode,
    branchScopeIds,
    branchScopeLabel,
    bypassIpRestriction: user.bypassIpRestriction,
    loginTimeWindowId: user.loginTimeWindowId,
    loginTimeWindowName: user.loginTimeWindow?.name ?? null,
    failedLoginCount: user.failedLoginCount,
    failedLoginLimit: user.failedLoginLimit,
    isActive: user.isActive,
    lockedAt: user.lockedAt,
    lockReason: user.lockReason,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
