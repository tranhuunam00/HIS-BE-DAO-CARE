export class StaffAssignment {
  constructor(
    public readonly id: string,
    public readonly staffId: string,
    public readonly branchId: string,
    public readonly specialtyId: string | null,
    public readonly roomId: string | null,
    public readonly isPrimary: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
