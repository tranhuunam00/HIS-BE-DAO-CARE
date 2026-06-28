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
