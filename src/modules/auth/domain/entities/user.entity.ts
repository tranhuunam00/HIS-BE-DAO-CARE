export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly refreshTokenHash: string | null,
    public readonly isActive: boolean,
    public readonly roleId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(
    id: string,
    email: string,
    passwordHash: string,
    roleId: string,
    isActive = true
  ): User {
    const now = new Date();
    return new User(id, email, passwordHash, null, isActive, roleId, now, now);
  }

  public updateRefreshToken(hash: string | null): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      hash,
      this.isActive,
      this.roleId,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      this.refreshTokenHash,
      false,
      this.roleId,
      this.createdAt,
      new Date()
    );
  }

  public activate(): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      this.refreshTokenHash,
      true,
      this.roleId,
      this.createdAt,
      new Date()
    );
  }
}
