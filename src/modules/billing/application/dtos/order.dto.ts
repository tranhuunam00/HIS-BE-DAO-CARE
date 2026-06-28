import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, Min, IsArray, IsIn } from 'class-validator';
import {
  ORDER_ITEM_RESULT_STATUS,
  ORDER_ITEM_STATUS,
  PAYMENT_METHOD,
  type OrderItemResultStatus,
  type OrderItemStatus,
  type PaymentMethod,
} from '../../../../common/constants/workflow.constants';

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
  @ApiProperty({ description: 'Trạng thái của dịch vụ', enum: ORDER_ITEM_STATUS })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(ORDER_ITEM_STATUS))
  status: OrderItemStatus;

  @ApiPropertyOptional({ description: 'Ghi chú kết quả thực hiện' })
  @IsOptional()
  @IsString()
  resultNotes?: string;

  @ApiPropertyOptional({ description: 'Trạng thái trả kết quả', enum: ORDER_ITEM_RESULT_STATUS })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(ORDER_ITEM_RESULT_STATUS))
  resultStatus?: OrderItemResultStatus;

  @ApiPropertyOptional({ description: 'ID cua nhan vien thuc hien (tinh KPI)' })
  @IsOptional()
  @IsUUID()
  performedById?: string;
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

  @ApiProperty({ description: 'Trang thai thanh toan cua dong dich vu' })
  isPaid: boolean;

  @ApiPropertyOptional()
  resultNotes?: string | null;

  @ApiPropertyOptional()
  resultStatus?: string;

  @ApiPropertyOptional({ description: 'ID cua nhan vien thuc hien' })
  performedById?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  service?: any;

  @ApiPropertyOptional({ description: 'Thong tin nhan vien thuc hien' })
  performedBy?: any;
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

  @ApiProperty({ description: 'Phương thức hoàn tiền', enum: PAYMENT_METHOD })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(PAYMENT_METHOD))
  paymentMethod: PaymentMethod;
}
