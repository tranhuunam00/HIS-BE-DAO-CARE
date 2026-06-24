import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BranchScopeMode, USERNAME_PATTERN } from '../../domain/constants/auth.constants';

export class CreateManagedUserDto {
  @ApiProperty({ example: 'staff-uuid' })
  @IsUUID()
  staffId: string;

  @ApiProperty({ example: '037090123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(12)
  identityNumber: string;

  @ApiProperty({ example: 'TranQuyen' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @Matches(USERNAME_PATTERN, { message: 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang' })
  username: string;

  @ApiProperty({ example: 'tranquyen@daocare.vn', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'role-uuid' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  defaultBranchId: string;

  @ApiProperty({ enum: BranchScopeMode, default: BranchScopeMode.SPECIFIC })
  @IsOptional()
  @IsIn(Object.values(BranchScopeMode))
  branchScopeMode?: BranchScopeMode;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  branchIds?: string[];

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  bypassIpRestriction?: boolean;

  @ApiProperty({ example: 'login-window-uuid', required: false, nullable: true })
  @IsOptional()
  @IsUUID()
  loginTimeWindowId?: string | null;

  @ApiProperty({ example: 15, required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  failedLoginLimit?: number | null;
}

export class UpdateManagedUserDto {
  @ApiProperty({ example: 'staff-uuid', required: false })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiProperty({ example: '037090123456', required: false })
  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(12)
  identityNumber?: string;

  @ApiProperty({ example: 'TranQuyen', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(USERNAME_PATTERN, { message: 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang' })
  username?: string;

  @ApiProperty({ example: 'tranquyen@daocare.vn', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'role-uuid', required: false })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiProperty({ example: 'branch-uuid', required: false })
  @IsOptional()
  @IsUUID()
  defaultBranchId?: string;

  @ApiProperty({ enum: BranchScopeMode, required: false })
  @IsOptional()
  @IsIn(Object.values(BranchScopeMode))
  branchScopeMode?: BranchScopeMode;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  branchIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  bypassIpRestriction?: boolean;

  @ApiProperty({ example: 'login-window-uuid', required: false, nullable: true })
  @IsOptional()
  @IsUUID()
  loginTimeWindowId?: string | null;

  @ApiProperty({ example: 15, required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  failedLoginLimit?: number | null;
}

export class ResetPasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LockUserDto {
  @ApiProperty({ example: 'Nghỉ việc', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpsertLoginTimeWindowDto {
  @ApiProperty({ example: '6 AM - 9 PM' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '06:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '21:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertBranchAllowedIpDto {
  @ApiProperty({ example: '192.168.1.10' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({ example: 'Wifi chi nhánh HeadOffice', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;
}

export class LoginTimeWindowResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  isActive: boolean;
}

export class BranchAllowedIpResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  ipAddress: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  isActive: boolean;
}

export class ManagedUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  username: string | null;

  @ApiProperty()
  roleId: string;

  @ApiProperty({ nullable: true })
  roleName: string | null;

  @ApiProperty({ nullable: true })
  staffId: string | null;

  @ApiProperty({ nullable: true })
  staffCode: string | null;

  @ApiProperty({ nullable: true })
  staffName: string | null;

  @ApiProperty({ nullable: true })
  staffIdentityNumber: string | null;

  @ApiProperty({ nullable: true })
  defaultBranchId: string | null;

  @ApiProperty({ nullable: true })
  defaultBranchName: string | null;

  @ApiProperty()
  branchScopeMode: string;

  @ApiProperty({ type: [String] })
  branchScopeIds: string[];

  @ApiProperty()
  branchScopeLabel: string;

  @ApiProperty()
  bypassIpRestriction: boolean;

  @ApiProperty({ nullable: true })
  loginTimeWindowId: string | null;

  @ApiProperty({ nullable: true })
  loginTimeWindowName: string | null;

  @ApiProperty()
  failedLoginCount: number;

  @ApiProperty({ nullable: true })
  failedLoginLimit: number | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ nullable: true })
  lockedAt: Date | null;

  @ApiProperty({ nullable: true })
  lockReason: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
