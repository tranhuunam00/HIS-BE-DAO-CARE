import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateAppointmentUseCase, UpdateAppointmentUseCase, ListAppointmentsUseCase, GetAppointmentUseCase } from '../appointment.use-cases';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { IPatientRepository } from '../../../domain/repositories/patient.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.model';
import { Patient } from '../../../domain/entities/patient.model';

describe('AppointmentUseCases', () => {
  let mockAppointmentRepository: jest.Mocked<IAppointmentRepository>;
  let mockPatientRepository: jest.Mocked<IPatientRepository>;
  let createAppointmentUseCase: CreateAppointmentUseCase;
  let updateAppointmentUseCase: UpdateAppointmentUseCase;
  let listAppointmentsUseCase: ListAppointmentsUseCase;
  let getAppointmentUseCase: GetAppointmentUseCase;

  const mockPatient = new Patient(
    'patient-uuid-123',
    'BN-2026-0001',
    'NGUYỄN VĂN A',
    '1900-01-01',
    'OTHER',
    '0961766816',
    null, null, null, null, null, null, null,
    new Date(), new Date()
  );

  const mockAppointment = new Appointment(
    'appointment-uuid-1',
    'LH260706-0001',
    'patient-uuid-123',
    'branch-uuid-1',
    'doctor-uuid-1',
    'room-uuid-1',
    'service-uuid-1',
    '2026-07-06',
    '08:30',
    '09:00',
    'BOOKED',
    'Đau bụng',
    '0961766816',
    true, // isGuest
    new Date(),
    new Date()
  );

  beforeEach(() => {
    mockAppointmentRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      save: jest.fn(),
      countAll: jest.fn(),
    } as any;

    mockPatientRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPhone: jest.fn(),
      findByCode: jest.fn(),
      findByCccd: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      countAll: jest.fn(),
    } as any;

    listAppointmentsUseCase = new ListAppointmentsUseCase(mockAppointmentRepository);
    getAppointmentUseCase = new GetAppointmentUseCase(mockAppointmentRepository);
    createAppointmentUseCase = new CreateAppointmentUseCase(mockAppointmentRepository, mockPatientRepository);
    updateAppointmentUseCase = new UpdateAppointmentUseCase(mockAppointmentRepository);
  });

  describe('CreateAppointmentUseCase', () => {
    const createDto = {
      patientId: 'patient-uuid-123',
      branchId: 'branch-uuid-1',
      doctorId: 'doctor-uuid-1',
      roomId: 'room-uuid-1',
      serviceId: 'service-uuid-1',
      appointmentDate: '2026-07-06',
      startTime: '08:30',
      endTime: '09:00',
      notes: 'Đau bụng',
      phone: '0961766816',
    };

    it('should successfully create a new appointment when patientId is provided (isGuest false)', async () => {
      mockAppointmentRepository.countAll.mockResolvedValue(0);
      mockAppointmentRepository.save.mockImplementation(async (d: any) => {
        return new Appointment(
          'appointment-uuid-1',
          d.appointmentCode,
          d.patientId,
          d.branchId,
          d.doctorId,
          d.roomId,
          d.serviceId,
          d.appointmentDate,
          d.startTime,
          d.endTime,
          d.status,
          d.notes,
          d.phone,
          d.isGuest,
          new Date(),
          new Date()
        );
      });

      const result = await createAppointmentUseCase.execute(createDto);

      expect(result.id).toBe('appointment-uuid-1');
      expect(result.patientId).toBe('patient-uuid-123');
      expect(result.isGuest).toBe(false);
    });

    it('should dynamically link and set isGuest true if patientId is omitted', async () => {
      const guestDto = { ...createDto, patientId: undefined };
      mockPatientRepository.findByPhone.mockResolvedValue(mockPatient);
      mockAppointmentRepository.countAll.mockResolvedValue(0);
      mockAppointmentRepository.save.mockImplementation(async (d: any) => {
        return new Appointment(
          'appointment-uuid-1',
          d.appointmentCode,
          d.patientId,
          d.branchId,
          d.doctorId,
          d.roomId,
          d.serviceId,
          d.appointmentDate,
          d.startTime,
          d.endTime,
          d.status,
          d.notes,
          d.phone,
          d.isGuest,
          new Date(),
          new Date()
        );
      });

      const result = await createAppointmentUseCase.execute(guestDto);

      expect(result.patientId).toBe('patient-uuid-123');
      expect(result.isGuest).toBe(true);
    });
  });

  describe('ListAppointmentsUseCase', () => {
    it('should retrieve appointments with isGuest mapping', async () => {
      mockAppointmentRepository.findAll.mockResolvedValue([mockAppointment]);

      const result = await listAppointmentsUseCase.execute({});

      expect(result[0].isGuest).toBe(true);
    });
  });
});
