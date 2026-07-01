import { NotFoundException, ConflictException } from '@nestjs/common';
import { ResetPatientPasswordUseCase } from '../reset-patient-password.use-case';
import { DataSource, Repository } from 'typeorm';
import { PatientOrmEntity } from '../../../infrastructure/database/patient.entity';
import { UserOrmEntity } from '../../../../auth/infrastructure/database/user.entity';
import { RoleOrmEntity } from '../../../../auth/infrastructure/database/role.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('ResetPatientPasswordUseCase', () => {
  let useCase: ResetPatientPasswordUseCase;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockPatientRepository: jest.Mocked<Repository<PatientOrmEntity>>;
  let mockUserRepository: jest.Mocked<Repository<UserOrmEntity>>;
  let mockRoleRepository: jest.Mocked<Repository<RoleOrmEntity>>;

  beforeEach(() => {
    mockPatientRepository = {
      findOneBy: jest.fn(),
    } as any;

    mockUserRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
    } as any;

    mockRoleRepository = {
      findOneBy: jest.fn(),
    } as any;

    mockDataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === PatientOrmEntity) return mockPatientRepository;
        if (entity === UserOrmEntity) return mockUserRepository;
        if (entity === RoleOrmEntity) return mockRoleRepository;
        return null;
      }),
    } as any;

    useCase = new ResetPatientPasswordUseCase(mockDataSource);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  it('should throw NotFoundException if patient does not exist', async () => {
    mockPatientRepository.findOneBy.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id', 'newpass123')).rejects.toThrow(
      new NotFoundException('Không tìm thấy hồ sơ bệnh nhân')
    );
  });

  it('should throw ConflictException if patient has no email and no phone', async () => {
    mockPatientRepository.findOneBy.mockResolvedValue({
      id: 'patient-id',
      email: null,
      phone: null,
    } as any);

    await expect(useCase.execute('patient-id', 'newpass123')).rejects.toThrow(
      new ConflictException('Hồ sơ bệnh nhân không có email hoặc số điện thoại để đăng ký tài khoản')
    );
  });

  it('should update password of existing user found by email', async () => {
    mockPatientRepository.findOneBy.mockResolvedValue({
      id: 'patient-id',
      fullName: 'Bệnh nhân Test',
      email: 'test@gmail.com',
      phone: '0901234567',
    } as any);

    const existingUser = {
      id: 'user-id',
      email: 'test@gmail.com',
      passwordHash: 'old-hash',
    };
    mockUserRepository.findOneBy.mockResolvedValue(existingUser as any);

    await useCase.execute('patient-id', 'newpass123');

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@gmail.com' });
    expect(existingUser.passwordHash).toBe('hashed-password');
    expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
  });

  it('should update password of existing user found by phone/username if not found by email', async () => {
    mockPatientRepository.findOneBy.mockResolvedValue({
      id: 'patient-id',
      fullName: 'Bệnh nhân Test',
      email: null,
      phone: '0901234567',
    } as any);

    const existingUser = {
      id: 'user-id',
      email: '0901234567@hisdaocare.com',
      username: '0901234567',
      passwordHash: 'old-hash',
    };
    mockUserRepository.findOneBy.mockResolvedValue(existingUser as any);

    await useCase.execute('patient-id', 'newpass123');

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ username: '0901234567' });
    expect(existingUser.passwordHash).toBe('hashed-password');
    expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
  });

  it('should create a new user account if user does not exist and patient role is found', async () => {
    mockPatientRepository.findOneBy.mockResolvedValue({
      id: 'patient-id',
      fullName: 'Bệnh nhân Test',
      email: 'test@gmail.com',
      phone: '0901234567',
    } as any);

    mockUserRepository.findOneBy.mockResolvedValue(null);
    mockRoleRepository.findOneBy.mockResolvedValue({ id: 'role-id', name: 'PATIENT' } as any);

    await useCase.execute('patient-id', 'newpass123');

    expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@gmail.com',
      username: '0901234567',
      passwordHash: 'hashed-password',
      roleId: 'role-id',
      isActive: true,
    }));
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if user does not exist and PATIENT role is not found', async () => {
    mockPatientRepository.findOneBy.mockResolvedValue({
      id: 'patient-id',
      fullName: 'Bệnh nhân Test',
      email: 'test@gmail.com',
      phone: '0901234567',
    } as any);

    mockUserRepository.findOneBy.mockResolvedValue(null);
    mockRoleRepository.findOneBy.mockResolvedValue(null);

    await expect(useCase.execute('patient-id', 'newpass123')).rejects.toThrow(
      new NotFoundException('Không tìm thấy vai trò PATIENT trong hệ thống')
    );
  });
});
