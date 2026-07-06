import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsDateString, IsIn, MinLength } from 'class-validator';
import {
  PATIENT_GENDER,
  type PatientGender,
} from '../../../../common/constants/workflow.constants';

export class CreatePatientDto {
  @ApiProperty({ description: 'Họ và tên bệnh nhân' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  dob: string;

  @ApiProperty({ description: 'Giới tính', enum: PATIENT_GENDER })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(PATIENT_GENDER))
  gender: PatientGender;

  @ApiProperty({ description: 'Số điện thoại liên hệ' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Địa chỉ email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ chi tiết' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Số CCCD' })
  @IsOptional()
  @IsString()
  cccd?: string;

  @ApiPropertyOptional({ description: 'Họ tên người giám hộ' })
  @IsOptional()
  @IsString()
  guardianName?: string;

  @ApiPropertyOptional({ description: 'SĐT người giám hộ' })
  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @ApiPropertyOptional({ description: 'Quan hệ với người giám hộ' })
  @IsOptional()
  @IsString()
  guardianRelation?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn ảnh đại diện' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Tên đăng nhập của tài khoản' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Mật khẩu đăng nhập' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password?: string;
}

export class UpdatePatientDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: PATIENT_GENDER })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(PATIENT_GENDER))
  gender?: PatientGender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cccd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guardianName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guardianRelation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Tên đăng nhập của tài khoản' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Mật khẩu đăng nhập' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password?: string;
}

export class PatientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientCode: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ required: false })
  dob: string | null;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ required: false })
  email: string | null;

  @ApiProperty({ required: false })
  address: string | null;

  @ApiProperty({ required: false })
  cccd: string | null;

  @ApiProperty({ required: false })
  guardianName: string | null;

  @ApiProperty({ required: false })
  guardianPhone: string | null;

  @ApiProperty({ required: false })
  guardianRelation: string | null;

  @ApiProperty({ required: false })
  avatarUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  username?: string | null;
}
