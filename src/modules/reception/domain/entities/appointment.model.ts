export class Appointment {
  constructor(
    public readonly id: string,
    public readonly appointmentCode: string,
    public readonly patientId: string,
    public readonly branchId: string,
    public readonly doctorId: string | null,
    public readonly roomId: string | null,
    public readonly serviceId: string | null,
    public readonly appointmentDate: string,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly status: string, // 'BOOKED' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED'
    public readonly notes: string | null,
    public readonly phone: string | null,
    public readonly isGuest: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly patient?: any,
    public readonly doctor?: any,
    public readonly room?: any,
    public readonly service?: any,
  ) {}
}
