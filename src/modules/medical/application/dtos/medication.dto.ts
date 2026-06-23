import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicationDto {
  @ApiProperty({ example: 'TH_PARACET_500' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'VD-12345-12', required: false })
  @IsOptional()
  @IsString()
  nationalCode?: string;

  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Paracetamol' })
  @IsString()
  @IsNotEmpty()
  activeIngredient: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  @IsNotEmpty()
  concentration: string;

  @ApiProperty({ example: 'Viên' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 'mg', required: false })
  @IsOptional()
  @IsString()
  usageUnit?: string;

  @ApiProperty({ example: 'ORAL', description: 'ORAL | INJECTION | TOPICAL | INHALATION | OTHER' })
  @IsString()
  @IsNotEmpty()
  routeOfAdministration: string;

  @ApiProperty({ example: '4000mg/ngày', required: false })
  @IsOptional()
  @IsString()
  maxDosePerDay?: string;

  @ApiProperty({ example: 'Giảm đau - Hạ sốt', required: false })
  @IsOptional()
  @IsString()
  groupName?: string;
}

export class UpdateMedicationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationalCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  activeIngredient?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  concentration?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  usageUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  routeOfAdministration?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  maxDosePerDay?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  groupName?: string;
}

export class MedicationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() nationalCode: string | null;
  @ApiProperty() name: string;
  @ApiProperty() activeIngredient: string;
  @ApiProperty() concentration: string;
  @ApiProperty() unit: string;
  @ApiProperty() usageUnit: string | null;
  @ApiProperty() routeOfAdministration: string;
  @ApiProperty() maxDosePerDay: string | null;
  @ApiProperty() groupName: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
