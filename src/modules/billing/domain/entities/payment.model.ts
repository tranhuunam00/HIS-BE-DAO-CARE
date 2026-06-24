export class Payment {
  constructor(
    public readonly id: string,
    public readonly paymentCode: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly paymentMethod: string, // 'CASH' | 'TRANSFER' | 'CARD'
    public readonly status: string, // 'SUCCESS' | 'FAILED'
    public readonly paidAt?: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly order?: any,
  ) {}
}
