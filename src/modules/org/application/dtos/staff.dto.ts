import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsDateString, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({ example: 'BS. Trần Hữu Nam' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'MALE', description: 'MALE, FEMALE, OTHER' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: '037090123456' })
  @IsString()
  @IsNotEmpty()
  identityNumber: string;

  @ApiProperty({ example: '0988777666' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'namth@daocare.vn' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Hà Nội, Việt Nam', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'NV0001' })
  @IsString()
  @IsNotEmpty()
  staffCode: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  @IsNotEmpty()
  joinDate: string;

  @ApiProperty({ example: 'DOCTOR', description: 'DOCTOR, NURSE, TECHNICIAN, RECEPTIONIST, ADMINISTRATOR, OTHER' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isClinical?: boolean;

  @ApiProperty({ example: '8521a944-cf1c-431a-a121-c62438179d2b', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateStaffDto {
  @ApiProperty({ example: 'BS. Trần Hữu Nam - Sửa', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'MALE', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: '037090123456', required: false })
  @IsOptional()
  @IsString()
  identityNumber?: string;

  @ApiProperty({ example: '0988777666', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'namth@daocare.vn', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Hà Nội, Việt Nam', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'DOCTOR', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isClinical?: boolean;

  @ApiProperty({ example: '8521a944-cf1c-431a-a121-c62438179d2b', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdatePracticingCertificateDto {
  @ApiProperty({ example: '12345/BYT-CCHN' })
  @IsString()
  @IsNotEmpty()
  certificateNumber: string;

  @ApiProperty({ example: '2020-05-15' })
  @IsDateString()
  @IsNotEmpty()
  issuedDate: string;

  @ApiProperty({ example: '2030-05-15', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ example: 'Bộ Y Tế' })
  @IsString()
  @IsNotEmpty()
  issuedBy: string;

  @ApiProperty({ example: 'Khám bệnh, chữa bệnh Nội khoa' })
  @IsString()
  @IsNotEmpty()
  scopeOfPractice: string;

  @ApiProperty({ example: 'http://minio/signatures/cchn_nam.png', required: false })
  @IsOptional()
  @IsString()
  signatureScanUrl?: string;
}

export class AssignStaffDto {
  @ApiProperty({ example: 'b0efcb3f-9b58-4834-9544-7d27f77a3108' })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'c0efcb3f-9b58-4834-9544-7d27f77a3108', required: false })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiProperty({ example: 'd0efcb3f-9b58-4834-9544-7d27f77a3108', required: false })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class PracticingCertificateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  certificateNumber: string;

  @ApiProperty()
  issuedDate: Date;

  @ApiProperty()
  expiryDate: Date | null;

  @ApiProperty()
  issuedBy: string;

  @ApiProperty()
  scopeOfPractice: string;

  @ApiProperty()
  signatureScanUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StaffAssignmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  specialtyId: string | null;

  @ApiProperty()
  roomId: string | null;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StaffResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  identityNumber: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  address: string | null;

  @ApiProperty()
  staffCode: string;

  @ApiProperty()
  joinDate: Date;

  @ApiProperty()
  title: string;

  @ApiProperty()
  isClinical: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  userId: string | null;

  @ApiProperty({ type: PracticingCertificateResponseDto, required: false })
  certificate: PracticingCertificateResponseDto | null;

  @ApiProperty({ type: [StaffAssignmentResponseDto], required: false })
  assignments: StaffAssignmentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
