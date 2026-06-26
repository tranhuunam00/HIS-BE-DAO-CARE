import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  BRANCH_TYPE,
  type BranchType,
} from '../../../../common/constants/workflow.constants';

export class CreateBranchDto {
  @ApiProperty({ example: 'Cơ sở Hà Nội - Hai Bà Trưng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CN_HBT_HN' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: BRANCH_TYPE, example: BRANCH_TYPE.CLINIC, required: false })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(BRANCH_TYPE))
  type?: BranchType;

  @ApiProperty({ example: 'BS. Trần Hữu Nam', required: false })
  @IsOptional()
  @IsString()
  technicalDirector?: string;

  @ApiProperty({ example: 'GP-456/HN', required: false })
  @IsOptional()
  @IsString()
  operatingLicense?: string;

  @ApiProperty({ example: '024777888', required: false })
  @IsOptional()
  @IsString()
  hotline?: string;

  @ApiProperty({ example: 'hbt@daocare.vn', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'VN', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Hà Nội', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ example: 'Hai Bà Trưng', required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ example: 'Số 1 Đại Cồ Việt', required: false })
  @IsOptional()
  @IsString()
  addressDetail?: string;

  @ApiProperty({ example: 'https://maps.app.goo.gl/tW53Jk8pLgJ6e1nE8', required: false })
  @IsOptional()
  @IsString()
  googleMapUrl?: string;

  @ApiProperty({ example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workingDays?: string[];

  @ApiProperty({ example: '08:00', required: false })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiProperty({ example: '20:00', required: false })
  @IsOptional()
  @IsString()
  closeTime?: string;

  @ApiProperty({ example: 'Vietcombank', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  bankAccountNo?: string;

  @ApiProperty({ example: 'CONG TY DAO CARE', required: false })
  @IsOptional()
  @IsString()
  bankAccountName?: string;
}

export class UpdateBranchDto {
  @ApiProperty({ example: 'Cơ sở Hà Nội - Hai Bà Trưng', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: BRANCH_TYPE, example: BRANCH_TYPE.CLINIC, required: false })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(BRANCH_TYPE))
  type?: BranchType;

  @ApiProperty({ example: 'BS. Trần Hữu Nam', required: false })
  @IsOptional()
  @IsString()
  technicalDirector?: string;

  @ApiProperty({ example: 'GP-456/HN', required: false })
  @IsOptional()
  @IsString()
  operatingLicense?: string;

  @ApiProperty({ example: '024777888', required: false })
  @IsOptional()
  @IsString()
  hotline?: string;

  @ApiProperty({ example: 'hbt@daocare.vn', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'VN', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Hà Nội', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ example: 'Hai Bà Trưng', required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ example: 'Số 1 Đại Cồ Việt', required: false })
  @IsOptional()
  @IsString()
  addressDetail?: string;

  @ApiProperty({ example: 'https://maps.app.goo.gl/tW53Jk8pLgJ6e1nE8', required: false })
  @IsOptional()
  @IsString()
  googleMapUrl?: string;

  @ApiProperty({ example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workingDays?: string[];

  @ApiProperty({ example: '08:00', required: false })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiProperty({ example: '20:00', required: false })
  @IsOptional()
  @IsString()
  closeTime?: string;

  @ApiProperty({ example: 'Vietcombank', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  bankAccountNo?: string;

  @ApiProperty({ example: 'CONG TY DAO CARE', required: false })
  @IsOptional()
  @IsString()
  bankAccountName?: string;
}

export class BranchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  technicalDirector: string | null;

  @ApiProperty()
  operatingLicense: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  hotline: string | null;

  @ApiProperty()
  email: string | null;

  @ApiProperty()
  country: string;

  @ApiProperty()
  province: string | null;

  @ApiProperty()
  district: string | null;

  @ApiProperty()
  addressDetail: string | null;

  @ApiProperty()
  googleMapUrl: string | null;

  @ApiProperty()
  workingDays: string[] | null;

  @ApiProperty()
  openTime: string;

  @ApiProperty()
  closeTime: string;

  @ApiProperty()
  bankName: string | null;

  @ApiProperty()
  bankAccountNo: string | null;

  @ApiProperty()
  bankAccountName: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
