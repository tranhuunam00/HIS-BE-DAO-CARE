export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly userName: string | null,
    public readonly userRole: string | null,
    public readonly action: string,
    public readonly module: string,
    public readonly description: string,
    public readonly ipAddress: string | null,
    public readonly createdAt: Date,
  ) {}

  public static create(
    userId: string | null,
    userName: string | null,
    userRole: string | null,
    action: string,
    module: string,
    description: string,
    ipAddress: string | null = null,
  ): AuditLog {
    return new AuditLog(
      '',
      userId,
      userName,
      userRole,
      action,
      module,
      description,
      ipAddress,
      new Date(),
    );
  }
}
