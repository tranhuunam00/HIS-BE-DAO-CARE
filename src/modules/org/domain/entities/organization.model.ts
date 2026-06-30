export class Organization {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly shortName: string | null,
    public readonly code: string,
    public readonly logoUrl: string | null,
    public readonly taxCode: string | null,
    public readonly operatingLicense: string | null,
    public readonly legalRepresentative: string | null,
    public readonly hotline: string | null,
    public readonly email: string | null,
    public readonly website: string | null,
    public readonly address: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(
    id: string,
    name: string,
    code: string,
    shortName?: string,
    taxCode?: string,
    legalRepresentative?: string,
    hotline?: string,
    email?: string,
    address?: string
  ): Organization {
    const now = new Date();
    return new Organization(
      id,
      name,
      shortName || null,
      code,
      null,
      taxCode || null,
      null,
      legalRepresentative || null,
      hotline || null,
      email || null,
      null,
      address || null,
      now,
      now
    );
  }
}
