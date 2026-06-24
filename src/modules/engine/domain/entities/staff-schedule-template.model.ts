export class StaffScheduleTemplate {
  constructor(
    public readonly id: string,
    public readonly staffId: string,
    public readonly branchId: string,
    public readonly dayOfWeek: string,
    public readonly shiftId: string,
    public readonly effectiveDate: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
