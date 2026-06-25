import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ description: 'Họ và tên bệnh nhân' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  dob: string;

  @ApiProperty({ description: 'Giới tính' })
  @IsNotEmpty()
  @IsString()
  gender: string; // 'MALE' | 'FEMALE' | 'OTHER'

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

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
}

export class PatientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientCode: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  dob: string;

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
}
