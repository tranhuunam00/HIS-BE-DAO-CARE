import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, Min, IsArray } from 'class-validator';

export class AddOrderItemDto {
  @ApiProperty({ description: 'ID của dịch vụ y tế' })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ description: 'Số lượng', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Giá tiền của dịch vụ' })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class UpdateOrderItemDto {
  @ApiProperty({ description: 'Trạng thái của dịch vụ', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Ghi chú kết quả thực hiện' })
  @IsOptional()
  @IsString()
  resultNotes?: string;

  @ApiPropertyOptional({ description: 'Trạng thái trả kết quả', enum: ['NONE', 'PENDING', 'COMPLETED'] })
  @IsOptional()
  @IsString()
  resultStatus?: string;
}

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  resultNotes?: string | null;

  @ApiPropertyOptional()
  resultStatus?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  service?: any;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderCode: string;

  @ApiProperty()
  visitId: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  visit?: any;

  @ApiPropertyOptional()
  patient?: any;

  @ApiPropertyOptional({ type: [OrderItemResponseDto] })
  items?: OrderItemResponseDto[];
}

export class RefundOrderDto {
  @ApiProperty({ description: 'Danh sách ID của các order item cần hoàn tiền' })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('all', { each: true })
  itemIds: string[];

  @ApiProperty({ description: 'Lý do hoàn trả' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Phương thức hoàn tiền (CASH | TRANSFER | CARD)' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;
}
