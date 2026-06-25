import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormTemplateDto {
  @ApiProperty({ example: 'Mẫu đơn thuốc chuẩn' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PRESCRIPTION_TEMPLATE' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'PRINT_TEMPLATE', description: 'PRINT_TEMPLATE | CLINICAL_TEMPLATE' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'PRESCRIPTION', description: 'INVOICE | PRESCRIPTION | LAB_RESULT | ULTRASOUND_RESULT' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '<html>...</html>' })
  @IsString()
  @IsNotEmpty()
  htmlContent: string;

  @ApiProperty({ example: 'Mô tả mẫu', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFormTemplateDto {
  @ApiProperty({ example: 'Mẫu đơn thuốc chuẩn - Sửa', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'PRESCRIPTION_TEMPLATE', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'PRINT_TEMPLATE', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 'PRESCRIPTION', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: '<html>...</html>', required: false })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiProperty({ example: 'Mô tả mẫu', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class FormTemplateResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty() type: string;
  @ApiProperty() category: string;
  @ApiProperty() htmlContent: string;
  @ApiProperty() description: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
