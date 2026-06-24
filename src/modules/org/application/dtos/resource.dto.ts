import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ example: 'a0efcb3f-9b58-4834-9544-7d27f77a3108' })
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ example: 'Ghế Nha Khoa Số 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'GNK01' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'CHAIR', description: 'CHAIR, BED, EQUIPMENT' })
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class UpdateResourceDto {
  @ApiProperty({ example: 'Ghế Nha Khoa Số 1 - Sửa', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'CHAIR', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

export class ResourceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roomId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isOccupied: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
