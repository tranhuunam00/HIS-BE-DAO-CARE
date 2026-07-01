import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePatientUseCase, UpdatePatientUseCase, ListPatientsUseCase, GetPatientUseCase } from '../patient.use-cases';
import { IPatientRepository } from '../../../domain/repositories/patient.repository.interface';
import { Patient } from '../../../domain/entities/patient.model';
import { DataSource } from 'typeorm';

describe('PatientUseCases', () => {
  let mockPatientRepository: jest.Mocked<IPatientRepository>;
  let mockDataSource: jest.Mocked<DataSource>;
  let createPatientUseCase: CreatePatientUseCase;
  let updatePatientUseCase: UpdatePatientUseCase;
  let listPatientsUseCase: ListPatientsUseCase;
  let getPatientUseCase: GetPatientUseCase;

  const mockPatient = new Patient(
    'patient-uuid-1',
    'BN-2026-0001',
    'NGUYỄN VĂN A',
    '1995-01-01',
    'MALE',
    '0901234567',
    'a@gmail.com',
    'Hà Nội',
    '001095000123',
    null,
    null,
    null,
    null,
    new Date(),
    new Date()
  );

  beforeEach(() => {
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

    mockDataSource = {
      getRepository: jest.fn(() => ({
        findOneBy: jest.fn().mockImplementation(async (criteria) => {
          if (criteria && criteria.name === 'PATIENT') {
            return { id: 'patient-role-id', name: 'PATIENT' };
          }
          return null;
        }),
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn((d) => d),
        save: jest.fn().mockImplementation(async (d) => d),
      })),
    } as any;

    listPatientsUseCase = new ListPatientsUseCase(mockPatientRepository, mockDataSource);
    getPatientUseCase = new GetPatientUseCase(mockPatientRepository, mockDataSource);
    createPatientUseCase = new CreatePatientUseCase(mockPatientRepository, mockDataSource);
    updatePatientUseCase = new UpdatePatientUseCase(mockPatientRepository, mockDataSource);
  });

  describe('CreatePatientUseCase', () => {
    const createDto = {
      fullName: 'NGUYỄN VĂN A',
      dob: '1995-01-01',
      gender: 'MALE' as any,
      phone: '0901234567',
      email: 'a@gmail.com',
      cccd: '001095000123',
      username: 'username123',
      password: 'password123',
    };

    it('should successfully create a new patient when phone and CCCD are unique', async () => {
      mockPatientRepository.findByPhone.mockResolvedValue(null);
      mockPatientRepository.findByCccd.mockResolvedValue(null);
      mockPatientRepository.countAll.mockResolvedValue(0);
      mockPatientRepository.save.mockResolvedValue(mockPatient);

      const result = await createPatientUseCase.execute(createDto);

      expect(result.id).toBe('patient-uuid-1');
      expect(mockPatientRepository.findByPhone).toHaveBeenCalledWith(createDto.phone);
      expect(mockPatientRepository.findByCccd).toHaveBeenCalledWith(createDto.cccd);
      expect(mockPatientRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if phone is already registered', async () => {
      mockPatientRepository.findByPhone.mockResolvedValue(mockPatient);

      await expect(createPatientUseCase.execute(createDto)).rejects.toThrow(
        new ConflictException('Số điện thoại bệnh nhân đã tồn tại trong hệ thống')
      );
      expect(mockPatientRepository.findByPhone).toHaveBeenCalledWith(createDto.phone);
      expect(mockPatientRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if CCCD is already registered', async () => {
      mockPatientRepository.findByPhone.mockResolvedValue(null);
      mockPatientRepository.findByCccd.mockResolvedValue(mockPatient);

      await expect(createPatientUseCase.execute(createDto)).rejects.toThrow(
        new ConflictException('Số CCCD bệnh nhân đã tồn tại trong hệ thống')
      );
      expect(mockPatientRepository.findByCccd).toHaveBeenCalledWith(createDto.cccd);
      expect(mockPatientRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('UpdatePatientUseCase', () => {
    const updateDto = {
      phone: '0907654321',
      cccd: '001095000999',
      username: 'username456',
      password: 'password456',
    };

    it('should successfully update patient details when phone and CCCD are unique', async () => {
      mockPatientRepository.findById.mockResolvedValue(mockPatient);
      mockPatientRepository.findByPhone.mockResolvedValue(null);
      mockPatientRepository.findByCccd.mockResolvedValue(null);
      mockPatientRepository.save.mockImplementation(async (data) => data as any);

      const result = await updatePatientUseCase.execute('patient-uuid-1', updateDto);

      expect(result.phone).toBe(updateDto.phone);
      expect(result.cccd).toBe(updateDto.cccd);
      expect(mockPatientRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if patient does not exist', async () => {
      mockPatientRepository.findById.mockResolvedValue(null);

      await expect(updatePatientUseCase.execute('invalid-id', updateDto)).rejects.toThrow(
        new NotFoundException('Không tìm thấy hồ sơ bệnh nhân')
      );
    });

    it('should throw ConflictException if updated phone is already used by another patient', async () => {
      mockPatientRepository.findById.mockResolvedValue(mockPatient);
      mockPatientRepository.findByPhone.mockResolvedValue({ ...mockPatient, id: 'patient-uuid-2' } as any);

      await expect(updatePatientUseCase.execute('patient-uuid-1', updateDto)).rejects.toThrow(
        new ConflictException('Số điện thoại này đã được sử dụng bởi bệnh nhân khác')
      );
    });

    it('should throw ConflictException if updated CCCD is already used by another patient', async () => {
      mockPatientRepository.findById.mockResolvedValue(mockPatient);
      mockPatientRepository.findByPhone.mockResolvedValue(null);
      mockPatientRepository.findByCccd.mockResolvedValue({ ...mockPatient, id: 'patient-uuid-2' } as any);

      await expect(updatePatientUseCase.execute('patient-uuid-1', updateDto)).rejects.toThrow(
        new ConflictException('Số CCCD này đã được sử dụng bởi bệnh nhân khác')
      );
    });

    it('should not perform checks if phone and CCCD remain the same', async () => {
      mockPatientRepository.findById.mockResolvedValue(mockPatient);
      mockPatientRepository.save.mockImplementation(async (data) => data as any);

      const result = await updatePatientUseCase.execute('patient-uuid-1', {
        phone: mockPatient.phone,
        cccd: mockPatient.cccd,
      });

      expect(result.phone).toBe(mockPatient.phone);
      expect(result.cccd).toBe(mockPatient.cccd);
      expect(mockPatientRepository.findByPhone).not.toHaveBeenCalled();
      expect(mockPatientRepository.findByCccd).not.toHaveBeenCalled();
    });
  });
});
