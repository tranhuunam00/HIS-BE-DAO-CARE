import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, Min, IsArray, IsIn, ValidateIf } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'ID cua nhan vien thuc hien (tinh KPI)', nullable: true })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  performedById?: string | null;
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

  @ApiProperty({ description: 'Trạng thái thanh toán của dòng dịch vụ' })
  isPaid: boolean;

  @ApiPropertyOptional()
  resultNotes?: string | null;

  @ApiPropertyOptional()
  resultStatus?: string;

  @ApiPropertyOptional({ description: 'ID của nhân viên thực hiện' })
  performedById?: string | null;

  @ApiPropertyOptional()
  performedBy?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  service?: any;
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID của đơn hàng cần thanh toán' })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Phương thức thanh toán', enum: PAYMENT_METHOD })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(PAYMENT_METHOD))
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Mã giao dịch ngân hàng / hóa đơn' })
  @IsOptional()
  @IsString()
  transactionCode?: string;
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

  @ApiProperty({ type: [OrderItemResponseDto], required: false })
  items?: OrderItemResponseDto[];
}

export class RefundOrderDto {
  @ApiProperty({ description: 'Danh sách ID dịch vụ chỉ định cần hoàn tiền', type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsUUID(undefined, { each: true })
  itemIds: string[];

  @ApiProperty({ description: 'Phương thức hoàn tiền', enum: PAYMENT_METHOD })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(PAYMENT_METHOD))
  paymentMethod: PaymentMethod;
}
