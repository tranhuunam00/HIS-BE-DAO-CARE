export class StaffAttendance {
  constructor(
    public readonly id: string,
    public readonly staffId: string,
    public readonly branchId: string,
    public readonly date: string, // YYYY-MM-DD
    public readonly shiftId: string,
    public readonly checkInTime: Date | null,
    public readonly checkOutTime: Date | null,
    public readonly checkoutReason: string | null,
    public readonly status: string, // 'CHECKED_IN' | 'CHECKED_OUT'
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly staff?: any,
    public readonly branch?: any,
    public readonly shift?: any,
  ) {}
}
