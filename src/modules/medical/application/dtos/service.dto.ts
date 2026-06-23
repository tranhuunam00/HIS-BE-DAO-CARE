import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, ValidateNested, IsArray, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ServicePriceDto {
  @ApiProperty({ example: 'LISTED', description: 'LISTED | INSURANCE | VIP' })
  @IsString()
  @IsNotEmpty()
  priceType: string;

  @ApiProperty({ example: 200000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vatRate?: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  effectiveDate: string;
}

export class ServicePriceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() serviceId: string;
  @ApiProperty() priceType: string;
  @ApiProperty() amount: number;
  @ApiProperty() vatRate: number;
  @ApiProperty() effectiveDate: Date;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class CreateServiceDto {
  @ApiProperty({ example: 'SP001', required: false })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiProperty({ example: 'DV_KN_NOI' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Khám Nội tổng quát' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'EXAMINATION', description: 'EXAMINATION | LAB_TEST | IMAGING | PROCEDURE | SURGERY | THERAPY' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '01.105', required: false })
  @IsOptional()
  @IsString()
  insuranceCode?: string;

  @ApiProperty({ example: 'Khám bệnh tổng quát', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({ example: 24, required: false })
  @IsOptional()
  @IsNumber()
  resultDurationHours?: number;

  @ApiProperty({ type: [ServicePriceDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePriceDto)
  prices?: ServicePriceDto[];
}

export class UpdateServiceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  insuranceCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  resultDurationHours?: number;
}

export class UpsertServicePriceDto {
  @ApiProperty({ type: [ServicePriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePriceDto)
  prices: ServicePriceDto[];
}

export class ServiceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() specialtyId: string | null;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty() category: string;
  @ApiProperty() insuranceCode: string | null;
  @ApiProperty() description: string | null;
  @ApiProperty() durationMinutes: number;
  @ApiProperty() resultDurationHours: number | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ type: [ServicePriceResponseDto] }) prices: ServicePriceResponseDto[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
