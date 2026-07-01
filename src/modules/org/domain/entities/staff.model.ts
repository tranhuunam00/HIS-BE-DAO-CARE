import { PracticingCertificate } from './practicing-certificate.model';
import { StaffAssignment } from './staff-assignment.model';

export class Staff {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly dateOfBirth: Date,
    public readonly gender: string,
    public readonly identityNumber: string,
    public readonly phone: string,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly staffCode: string,
    public readonly joinDate: Date,
    public readonly title: string, // DOCTOR, NURSE, etc.
    public readonly isActive: boolean,
    public readonly userId: string | null,
    public readonly nickname: string | null,
    public readonly avatarUrl: string | null,
    public readonly academicTitle: string | null,
    public readonly degree: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly certificate?: PracticingCertificate | null,
    public readonly assignments?: StaffAssignment[]
  ) {}
}
