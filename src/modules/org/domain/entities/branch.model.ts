import { BRANCH_TYPE } from '../../../../common/constants/workflow.constants';

export class Branch {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly type: string,
    public readonly technicalDirector: string | null,
    public readonly operatingLicense: string | null,
    public readonly isActive: boolean,
    public readonly hotline: string | null,
    public readonly email: string | null,
    public readonly country: string,
    public readonly province: string | null,
    public readonly district: string | null,
    public readonly addressDetail: string | null,
    public readonly latitude: number | null,
    public readonly longitude: number | null,
    public readonly workingDays: string[] | null,
    public readonly openTime: string,
    public readonly closeTime: string,
    public readonly bankName: string | null,
    public readonly bankAccountNo: string | null,
    public readonly bankAccountName: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(
    id: string,
    organizationId: string,
    name: string,
    code: string,
    type = BRANCH_TYPE.CLINIC,
    technicalDirector?: string,
    hotline?: string,
    email?: string,
    province?: string,
    district?: string,
    addressDetail?: string,
    latitude?: number,
    longitude?: number,
    workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openTime = '08:00',
    closeTime = '20:00',
    bankName?: string,
    bankAccountNo?: string,
    bankAccountName?: string
  ): Branch {
    const now = new Date();
    return new Branch(
      id,
      organizationId,
      name,
      code,
      type,
      technicalDirector || null,
      null,
      true,
      hotline || null,
      email || null,
      'VN',
      province || null,
      district || null,
      addressDetail || null,
      latitude !== undefined ? latitude : null,
      longitude !== undefined ? longitude : null,
      workingDays,
      openTime,
      closeTime,
      bankName || null,
      bankAccountNo || null,
      bankAccountName || null,
      now,
      now
    );
  }
}
