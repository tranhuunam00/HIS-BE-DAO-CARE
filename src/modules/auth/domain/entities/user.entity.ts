export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string | null,
    public readonly passwordHash: string,
    public readonly refreshTokenHash: string | null,
    public readonly isActive: boolean,
    public readonly roleId: string,
    public readonly defaultBranchId: string | null,
    public readonly branchScopeMode: string,
    public readonly bypassIpRestriction: boolean,
    public readonly loginTimeWindowId: string | null,
    public readonly failedLoginCount: number,
    public readonly failedLoginLimit: number | null,
    public readonly lockedAt: Date | null,
    public readonly lockedBy: string | null,
    public readonly lockReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly branchScopeIds: string[] = []
  ) {}

  public static create(
    id: string,
    email: string,
    username: string | null,
    passwordHash: string,
    roleId: string,
    isActive = true,
    defaultBranchId: string | null = null,
    branchScopeMode = 'SPECIFIC',
    bypassIpRestriction = true,
    loginTimeWindowId: string | null = null,
    failedLoginLimit: number | null = null
  ): User {
    const now = new Date();
    return new User(
      id,
      email,
      username,
      passwordHash,
      null,
      isActive,
      roleId,
      defaultBranchId,
      branchScopeMode,
      bypassIpRestriction,
      loginTimeWindowId,
      0,
      failedLoginLimit,
      null,
      null,
      null,
      now,
      now
    );
  }

  public updateRefreshToken(hash: string | null): User {
    return new User(
      this.id,
      this.email,
      this.username,
      this.passwordHash,
      hash,
      this.isActive,
      this.roleId,
      this.defaultBranchId,
      this.branchScopeMode,
      this.bypassIpRestriction,
      this.loginTimeWindowId,
      this.failedLoginCount,
      this.failedLoginLimit,
      this.lockedAt,
      this.lockedBy,
      this.lockReason,
      this.createdAt,
      new Date(),
      this.branchScopeIds
    );
  }

  public deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.username,
      this.passwordHash,
      this.refreshTokenHash,
      false,
      this.roleId,
      this.defaultBranchId,
      this.branchScopeMode,
      this.bypassIpRestriction,
      this.loginTimeWindowId,
      this.failedLoginCount,
      this.failedLoginLimit,
      this.lockedAt,
      this.lockedBy,
      this.lockReason,
      this.createdAt,
      new Date(),
      this.branchScopeIds
    );
  }

  public activate(): User {
    return new User(
      this.id,
      this.email,
      this.username,
      this.passwordHash,
      this.refreshTokenHash,
      true,
      this.roleId,
      this.defaultBranchId,
      this.branchScopeMode,
      this.bypassIpRestriction,
      this.loginTimeWindowId,
      this.failedLoginCount,
      this.failedLoginLimit,
      null,
      null,
      null,
      this.createdAt,
      new Date(),
      this.branchScopeIds
    );
  }

  public changePassword(passwordHash: string): User {
    return new User(
      this.id,
      this.email,
      this.username,
      passwordHash,
      null,
      this.isActive,
      this.roleId,
      this.defaultBranchId,
      this.branchScopeMode,
      this.bypassIpRestriction,
      this.loginTimeWindowId,
      0,
      this.failedLoginLimit,
      this.lockedAt,
      this.lockedBy,
      this.lockReason,
      this.createdAt,
      new Date(),
      this.branchScopeIds
    );
  }

  public recordFailedLogin(limit: number): User {
    const nextCount = this.failedLoginCount + 1;
    const shouldLock = nextCount >= limit;

    return new User(
      this.id,
      this.email,
      this.username,
      this.passwordHash,
      shouldLock ? null : this.refreshTokenHash,
      shouldLock ? false : this.isActive,
      this.roleId,
      this.defaultBranchId,
      this.branchScopeMode,
      this.bypassIpRestriction,
      this.loginTimeWindowId,
      nextCount,
      this.failedLoginLimit,
      shouldLock ? new Date() : this.lockedAt,
      this.lockedBy,
      shouldLock ? 'Sai mật khẩu vượt quá giới hạn' : this.lockReason,
      this.createdAt,
      new Date(),
      this.branchScopeIds
    );
  }

  public resetFailedLoginCount(): User {
    return new User(
      this.id,
      this.email,
      this.username,
      this.passwordHash,
      this.refreshTokenHash,
      this.isActive,
      this.roleId,
      this.defaultBranchId,
      this.branchScopeMode,
      this.bypassIpRestriction,
      this.loginTimeWindowId,
      0,
      this.failedLoginLimit,
      this.lockedAt,
      this.lockedBy,
      this.lockReason,
      this.createdAt,
      new Date(),
      this.branchScopeIds
    );
  }

  public lock(lockedBy: string | null, reason: string | null): User {
    return new User(
      this.id,
      this.email,
      this.username,
      this.passwordHash,
      null,
      false,
      this.roleId,
      this.defaultBranchId,
      this.branchScopeMode,
      this.bypassIpRestriction,
      this.loginTimeWindowId,
      this.failedLoginCount,
      this.failedLoginLimit,
      new Date(),
      lockedBy,
      reason,
      this.createdAt,
      new Date(),
      this.branchScopeIds
    );
  }
}
