import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'NOI', description: 'Mã chuyên khoa duy nhất' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Nội khoa' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Chuyên khoa nội tổng quát', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://cdn.example.com/noi.svg', required: false })
  @IsOptional()
  @IsString()
  iconUrl?: string;
}

export class UpdateSpecialtyDto {
  @ApiProperty({ example: 'Nội khoa (cập nhật)', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  iconUrl?: string;
}

export class SpecialtyResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty() description: string | null;
  @ApiProperty() iconUrl: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
