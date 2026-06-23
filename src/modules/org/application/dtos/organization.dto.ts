import { IsString, IsOptional, IsEmail, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiProperty({ example: 'Hệ thống Phòng khám DAO CARE' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'DAO CARE', required: false })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiProperty({ example: 'logo_url_here', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ example: '0102030405', required: false })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiProperty({ example: 'GP-123/BYT', required: false })
  @IsOptional()
  @IsString()
  operatingLicense?: string;

  @ApiProperty({ example: 'Trần Hữu Nam', required: false })
  @IsOptional()
  @IsString()
  legalRepresentative?: string;

  @ApiProperty({ example: '19001234', required: false })
  @IsOptional()
  @IsString()
  hotline?: string;

  @ApiProperty({ example: 'contact@daocare.vn', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://daocare.vn', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'Số 1 Đại Cồ Việt, Hà Nội', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'vi', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'Asia/Ho_Chi_Minh', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'VN', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'VND', required: false })
  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @ApiProperty({ example: 'YYYY-MM-DD', required: false })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiProperty({ example: 'HH:mm:ss', required: false })
  @IsOptional()
  @IsString()
  timeFormat?: string;

  @ApiProperty({ example: 'standard', required: false })
  @IsOptional()
  @IsString()
  currencyFormat?: string;

  @ApiProperty({ example: 300, required: false })
  @IsOptional()
  @IsInt()
  @Min(60)
  otpExpirationTime?: number;

  @ApiProperty({ example: 24, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  appointmentCancellationLimit?: number;

  @ApiProperty({ example: 'MRN-{YY}{MM}{DD}-{SEQ}', required: false })
  @IsOptional()
  @IsString()
  mrnFormat?: string;

  @ApiProperty({ example: 'PT-{YY}{MM}-{SEQ}', required: false })
  @IsOptional()
  @IsString()
  patientCodeFormat?: string;

  @ApiProperty({ example: 'VS-{YY}{MM}{DD}-{SEQ}', required: false })
  @IsOptional()
  @IsString()
  visitCodeFormat?: string;
}

export class OrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string | null;

  @ApiProperty()
  code: string;

  @ApiProperty()
  logoUrl: string | null;

  @ApiProperty()
  taxCode: string | null;

  @ApiProperty()
  operatingLicense: string | null;

  @ApiProperty()
  legalRepresentative: string | null;

  @ApiProperty()
  hotline: string | null;

  @ApiProperty()
  email: string | null;

  @ApiProperty()
  website: string | null;

  @ApiProperty()
  address: string | null;

  @ApiProperty()
  language: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  defaultCurrency: string;

  @ApiProperty()
  dateFormat: string;

  @ApiProperty()
  timeFormat: string;

  @ApiProperty()
  currencyFormat: string;

  @ApiProperty()
  otpExpirationTime: number;

  @ApiProperty()
  appointmentCancellationLimit: number;

  @ApiProperty()
  mrnFormat: string;

  @ApiProperty()
  patientCodeFormat: string;

  @ApiProperty()
  visitCodeFormat: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
