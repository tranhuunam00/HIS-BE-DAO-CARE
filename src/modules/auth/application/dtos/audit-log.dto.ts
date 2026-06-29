import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @ApiPropertyOptional({ description: 'ID của user thao tác' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Tên của user thao tác' })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({ description: 'Vai trò của user thao tác' })
  @IsString()
  @IsOptional()
  userRole?: string;

  @ApiProperty({ description: 'Hành động thực hiện' })
  @IsString()
  action: string;

  @ApiProperty({ description: 'Phân hệ / Module bị tác động' })
  @IsString()
  module: string;

  @ApiProperty({ description: 'Mô tả chi tiết thao tác' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Địa chỉ IP' })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}

export class QueryAuditLogDto {
  @ApiPropertyOptional({ description: 'Lọc theo Module' })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ description: 'Lọc theo hành động' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (User, Vai trò, Mô tả)' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Số lượng tối đa trả về', default: 50 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Vị trí bắt đầu', default: 0 })
  @IsOptional()
  offset?: number;
}

export class AuditLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: String, nullable: true })
  userId: string | null;

  @ApiProperty({ type: String, nullable: true })
  userName: string | null;

  @ApiProperty({ type: String, nullable: true })
  userRole: string | null;

  @ApiProperty()
  action: string;

  @ApiProperty()
  module: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: String, nullable: true })
  ipAddress: string | null;

  @ApiProperty()
  createdAt: Date;
}
