export class PatientVisit {
  constructor(
    public readonly id: string,
    public readonly visitCode: string,
    public readonly patientId: string,
    public readonly branchId: string,
    public readonly appointmentId: string | null,
    public readonly currentRoomId: string | null,
    public readonly currentDoctorId: string | null,
    public readonly currentNurseId: string | null,
    public readonly queueNumber: number,
    public readonly status: string, // 'WAITING' | 'IN_ROOM' | 'COMPLETED' | 'CANCELLED'
    public readonly reason: string | null,
    // Vital Signs
    public readonly pulse: number | null,
    public readonly bloodPressure: string | null,
    public readonly temperature: number | null,
    public readonly weight: number | null,
    public readonly height: number | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly patient?: any,
    public readonly branch?: any,
    public readonly currentRoom?: any,
    public readonly currentDoctor?: any,
    public readonly currentNurse?: any,
  ) {}
}
