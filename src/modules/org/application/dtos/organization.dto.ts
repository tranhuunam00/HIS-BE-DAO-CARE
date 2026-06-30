import { IsString, IsOptional, IsEmail } from 'class-validator';
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
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
