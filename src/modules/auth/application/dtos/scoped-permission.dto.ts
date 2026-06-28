import {
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveRoleScopedPermissionDto {
  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canView?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canRead?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canApprove?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canConsult?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canCancelConsult?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canEdit?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canDelete?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canUpdateHis?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canShare?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canStats?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canCancelApprove?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canDeleteSeries?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canViewHistory?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canRegisterPatient?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canUpdatePatient?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canDeletePatient?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canManageAppointment?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canCheckIn?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canPerformExam?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canOrderServices?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canPrescribeMedicine?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canConcludeExam?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canExecuteLaboratory?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canApproveResult?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canCollectPayment?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canRefundPayment?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canViewFinancialReports?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canViewClinicalReports?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canManagePharmacyStock?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canDispenseMedicine?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canManageSchedules?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canManageHR?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canConfigureCatalog?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  canConfigureSystem?: boolean;
}

export class SaveUserCustomPermissionDto extends SaveRoleScopedPermissionDto {}

export class ScopedPermissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  userId?: string | null;

  @ApiProperty({ required: false })
  roleId?: string | null;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  branchName: string;

  @ApiProperty()
  canView: boolean;

  @ApiProperty()
  canRead: boolean;

  @ApiProperty()
  canApprove: boolean;

  @ApiProperty()
  canConsult: boolean;

  @ApiProperty()
  canCancelConsult: boolean;

  @ApiProperty()
  canEdit: boolean;

  @ApiProperty()
  canDelete: boolean;

  @ApiProperty()
  canUpdateHis: boolean;

  @ApiProperty()
  canShare: boolean;

  @ApiProperty()
  canStats: boolean;

  @ApiProperty()
  canCancelApprove: boolean;

  @ApiProperty()
  canDeleteSeries: boolean;

  @ApiProperty()
  canViewHistory: boolean;

  @ApiProperty()
  canRegisterPatient: boolean;

  @ApiProperty()
  canUpdatePatient: boolean;

  @ApiProperty()
  canDeletePatient: boolean;

  @ApiProperty()
  canManageAppointment: boolean;

  @ApiProperty()
  canCheckIn: boolean;

  @ApiProperty()
  canPerformExam: boolean;

  @ApiProperty()
  canOrderServices: boolean;

  @ApiProperty()
  canPrescribeMedicine: boolean;

  @ApiProperty()
  canConcludeExam: boolean;

  @ApiProperty()
  canExecuteLaboratory: boolean;

  @ApiProperty()
  canApproveResult: boolean;

  @ApiProperty()
  canCollectPayment: boolean;

  @ApiProperty()
  canRefundPayment: boolean;

  @ApiProperty()
  canViewFinancialReports: boolean;

  @ApiProperty()
  canViewClinicalReports: boolean;

  @ApiProperty()
  canManagePharmacyStock: boolean;

  @ApiProperty()
  canDispenseMedicine: boolean;

  @ApiProperty()
  canManageSchedules: boolean;

  @ApiProperty()
  canManageHR: boolean;

  @ApiProperty()
  canConfigureCatalog: boolean;

  @ApiProperty()
  canConfigureSystem: boolean;
}

export class UserScopedPermissionsListDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  roleId: string;

  @ApiProperty()
  roleName: string;

  @ApiProperty({ type: [ScopedPermissionResponseDto] })
  permissions: ScopedPermissionResponseDto[];
}
