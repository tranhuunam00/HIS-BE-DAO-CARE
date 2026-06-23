export class Medication {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly nationalCode: string | null,
    public readonly name: string,
    public readonly activeIngredient: string,
    public readonly concentration: string,
    public readonly unit: string,
    public readonly usageUnit: string | null,
    public readonly routeOfAdministration: string, // ORAL | INJECTION | TOPICAL | INHALATION | OTHER
    public readonly maxDosePerDay: string | null,
    public readonly groupName: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
