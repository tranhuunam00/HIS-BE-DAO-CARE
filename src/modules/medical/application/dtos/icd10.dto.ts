import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIcd10Dto {
  @ApiProperty({ example: 'J06', description: 'Mã ICD-10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Nhiễm trùng hô hấp trên cấp tính' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Acute upper respiratory infections', required: false })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ example: 'uuid-here', required: false })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;
}

export class UpdateIcd10Dto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;
}

export class Icd10ResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty() nameEn: string | null;
  @ApiProperty() specialtyId: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedIcd10ResponseDto {
  @ApiProperty({ type: [Icd10ResponseDto] }) data: Icd10ResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
