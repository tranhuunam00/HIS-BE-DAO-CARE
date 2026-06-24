export class Department {
  constructor(
    public readonly id: string,
    public readonly branchId: string | null,
    public readonly name: string,
    public readonly code: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(
    id: string,
    branchId: string | null,
    name: string,
    code: string,
    description?: string
  ): Department {
    const now = new Date();
    return new Department(
      id,
      branchId,
      name,
      code,
      description || null,
      true,
      now,
      now
    );
  }
}
