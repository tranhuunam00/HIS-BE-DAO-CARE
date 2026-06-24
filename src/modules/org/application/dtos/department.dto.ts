import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'b0efcb3f-9b58-4834-9544-7d27f77a3108', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: 'Bộ phận Lễ tân' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'DEPT_LETAN' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Phụ trách đón tiếp, hướng dẫn người bệnh và thu ngân', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Bộ phận Lễ tân - Sửa', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Mô tả mới', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'b0efcb3f-9b58-4834-9544-7d27f77a3108', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class DepartmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branchId: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
