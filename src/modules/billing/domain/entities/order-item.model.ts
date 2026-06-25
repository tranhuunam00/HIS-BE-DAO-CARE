export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly serviceId: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly status: string, // 'PENDING' | 'COMPLETED' | 'CANCELLED'
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly service?: any,
    public readonly resultNotes?: string | null,
    public readonly resultStatus?: string, // 'NONE' | 'PENDING' | 'COMPLETED'
    public readonly performedById?: string | null,
    public readonly performedBy?: any,
  ) {}
}
