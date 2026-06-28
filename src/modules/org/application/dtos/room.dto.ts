import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min, IsIn, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceResponseDto } from './resource.dto';
import {
  ROOM_TYPE,
  type RoomType,
} from '../../../../common/constants/workflow.constants';

export class CreateRoomDto {
  @ApiProperty({ example: 'b0efcb3f-9b58-4834-9544-7d27f77a3108' })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'Phòng Khám 101' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PK101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: ROOM_TYPE, example: ROOM_TYPE.CLINIC })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(ROOM_TYPE))
  type: RoomType;

  @ApiProperty({ example: 'c0efcb3f-9b58-4834-9544-7d27f77a3108', required: false })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiProperty({ example: 'Tầng 1', required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  serviceIds?: string[];
}

export class UpdateRoomDto {
  @ApiProperty({ example: 'Phòng Khám 101 - Sửa', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: ROOM_TYPE, example: ROOM_TYPE.CLINIC, required: false })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(ROOM_TYPE))
  type?: RoomType;

  @ApiProperty({ example: 'c0efcb3f-9b58-4834-9544-7d27f77a3108', required: false })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiProperty({ example: 'Tầng 2', required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ example: 6, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  serviceIds?: string[];
}

export class RoomResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  specialtyId: string | null;

  @ApiProperty()
  floor: string | null;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [ResourceResponseDto], required: false })
  resources?: ResourceResponseDto[];

  @ApiProperty({ type: [String], required: false })
  serviceIds?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
