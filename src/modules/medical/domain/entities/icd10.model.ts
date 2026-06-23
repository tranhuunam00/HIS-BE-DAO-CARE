export class Icd10 {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly nameEn: string | null,
    public readonly specialtyId: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
