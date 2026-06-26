import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  FORM_TEMPLATE_CATEGORY,
  FORM_TEMPLATE_TYPE,
  type FormTemplateCategory,
  type FormTemplateType,
} from '../../../../common/constants/workflow.constants';

export class CreateFormTemplateDto {
  @ApiProperty({ example: 'Mẫu đơn thuốc chuẩn' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PRESCRIPTION_TEMPLATE' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: FORM_TEMPLATE_TYPE, example: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(FORM_TEMPLATE_TYPE))
  type: FormTemplateType;

  @ApiProperty({ enum: FORM_TEMPLATE_CATEGORY, example: FORM_TEMPLATE_CATEGORY.PRESCRIPTION })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(FORM_TEMPLATE_CATEGORY))
  category: FormTemplateCategory;

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

  @ApiProperty({ enum: FORM_TEMPLATE_TYPE, example: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE, required: false })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(FORM_TEMPLATE_TYPE))
  type?: FormTemplateType;

  @ApiProperty({ enum: FORM_TEMPLATE_CATEGORY, example: FORM_TEMPLATE_CATEGORY.PRESCRIPTION, required: false })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(FORM_TEMPLATE_CATEGORY))
  category?: FormTemplateCategory;

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
