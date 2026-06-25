import { Appointment } from '../entities/appointment.model';

export interface IAppointmentRepository {
  findAll(filters: { branchId?: string; doctorId?: string; date?: string; status?: string; phone?: string }): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  findByCode(code: string): Promise<Appointment | null>;
  save(appointment: Omit<Appointment, 'id'> & { id?: string }): Promise<Appointment>;
  countAll(): Promise<number>;
  getDoctorAppointments(doctorId: string, date: string): Promise<Appointment[]>;
}
