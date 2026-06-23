export class ServicePrice {
  constructor(
    public readonly id: string,
    public readonly serviceId: string,
    public readonly priceType: string, // LISTED | INSURANCE | VIP
    public readonly amount: number,
    public readonly vatRate: number,
    public readonly effectiveDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
