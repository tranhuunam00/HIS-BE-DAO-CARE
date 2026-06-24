export class Patient {
  constructor(
    public readonly id: string,
    public readonly patientCode: string,
    public readonly fullName: string,
    public readonly dob: string,
    public readonly gender: string,
    public readonly phone: string,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly cccd: string | null,
    public readonly guardianName: string | null,
    public readonly guardianPhone: string | null,
    public readonly guardianRelation: string | null,
    public readonly avatarUrl: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
