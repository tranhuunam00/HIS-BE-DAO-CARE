import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsNumber, Min, IsIn } from 'class-validator';
import {
  PAYMENT_METHOD,
  type PaymentMethod,
} from '../../../../common/constants/workflow.constants';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID của hóa đơn' })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Số tiền thanh toán' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Phương thức thanh toán', enum: PAYMENT_METHOD })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(PAYMENT_METHOD))
  paymentMethod: PaymentMethod;
}

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  paymentCode: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  paidAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  order?: any;
}
