export class StaffScheduleOverride {
  constructor(
    public readonly id: string,
    public readonly staffId: string,
    public readonly date: string,
    public readonly overrideType: string, // 'LEAVE' | 'WORK'
    public readonly branchId: string | null,
    public readonly shiftId: string | null,
    public readonly reason: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
