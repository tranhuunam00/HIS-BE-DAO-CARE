import { OrderItem } from './order-item.model';

export class Order {
  constructor(
    public readonly id: string,
    public readonly orderCode: string,
    public readonly visitId: string,
    public readonly patientId: string,
    public readonly status: string, // 'PENDING' | 'PAID' | 'CANCELLED'
    public readonly totalAmount: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly visit?: any,
    public readonly patient?: any,
    public readonly items?: OrderItem[],
  ) {}
}
