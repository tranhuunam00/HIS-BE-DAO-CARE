import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, ValidateNested, IsArray, IsDateString, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  SERVICE_CATEGORY,
  SERVICE_PRICE_TYPE,
  type ServiceCategory,
  type ServicePriceType,
} from '../../../../common/constants/workflow.constants';

export class ServicePriceDto {
  @ApiProperty({ enum: SERVICE_PRICE_TYPE, example: SERVICE_PRICE_TYPE.LISTED })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(SERVICE_PRICE_TYPE))
  priceType: ServicePriceType;

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

  @ApiProperty({ enum: SERVICE_CATEGORY, example: SERVICE_CATEGORY.EXAMINATION })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(SERVICE_CATEGORY))
  category: ServiceCategory;

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

  @ApiProperty({ enum: SERVICE_CATEGORY, required: false })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(SERVICE_CATEGORY))
  category?: ServiceCategory;

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
