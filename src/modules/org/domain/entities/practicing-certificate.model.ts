export class PracticingCertificate {
  constructor(
    public readonly id: string,
    public readonly staffId: string,
    public readonly certificateNumber: string,
    public readonly issuedDate: Date,
    public readonly expiryDate: Date | null,
    public readonly issuedBy: string,
    public readonly scopeOfPractice: string,
    public readonly signatureScanUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
