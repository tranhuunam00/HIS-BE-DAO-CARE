import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { GoogleLoginUseCase } from '../google-login.use-case';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { RoleOrmEntity } from '../../../infrastructure/database/role.entity';
import { PermissionOrmEntity } from '../../../infrastructure/database/permission.entity';
import { PatientOrmEntity } from '../../../../reception/infrastructure/database/patient.entity';
import { StaffOrmEntity } from '../../../../org/infrastructure/database/staff.entity';

describe('GoogleLoginUseCase', () => {
  const googleClientId = 'google-client-id.apps.googleusercontent.com';
  const originalFetch = (global as any).fetch;
  const originalGoogleMailerClientId = process.env.GOOGLE_MAILER_CLIENT_ID;

  let usersDb: Map<string, User>;
  let patientsByEmail: PatientOrmEntity[];
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockJwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let roleRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let patientRepository: {
    createQueryBuilder: jest.Mock;
    findOneBy: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let permissionRepository: {
    find: jest.Mock;
  };
  let mockDataSource: DataSource;

  beforeEach(() => {
    process.env.GOOGLE_MAILER_CLIENT_ID = googleClientId;
    usersDb = new Map();
    patientsByEmail = [];

    mockUserRepository = {
      findByEmail: jest.fn(async (email: string) => {
        for (const user of usersDb.values()) {
          if (user.email === email) {
            return user;
          }
        }
        return null;
      }),
      findByUsername: jest.fn(),
      findByLoginIdentity: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(async (user: User) => {
        usersDb.set(user.id, user);
        return user;
      }),
    };

    mockJwtService = {
      signAsync: jest.fn(async (payload: { sub: string }, options?: { expiresIn?: string }) => {
        return `token-${payload.sub}-${options?.expiresIn ?? 'default'}`;
      }),
    };

    roleRepository = {
      findOne: jest.fn(async () => null),
      create: jest.fn((data: Partial<RoleOrmEntity>) => ({
        id: 'patient-role-id',
        users: [],
        ...data,
      })),
      save: jest.fn(async (role: RoleOrmEntity) => role),
    };

    patientRepository = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(async () => patientsByEmail),
      })),
      findOneBy: jest.fn(async () => null),
      count: jest.fn(async () => 0),
      create: jest.fn((data: Partial<PatientOrmEntity>) => ({
        id: 'patient-id',
        createdAt: new Date('2026-06-25T00:00:00.000Z'),
        updatedAt: new Date('2026-06-25T00:00:00.000Z'),
        ...data,
      })),
      save: jest.fn(async (patient: PatientOrmEntity) => patient),
    };

    permissionRepository = {
      find: jest.fn(async () => []),
    };

    mockDataSource = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === RoleOrmEntity) {
          return roleRepository;
        }
        if (entity === PatientOrmEntity) {
          return patientRepository;
        }
        if (entity === PermissionOrmEntity) {
          return permissionRepository;
        }
        if (entity === StaffOrmEntity) {
          return {
            findOneBy: jest.fn(async () => null),
          };
        }
        throw new Error('Unexpected repository');
      }),
    } as unknown as DataSource;

    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        aud: googleClientId,
        email: 'Patient@Example.com',
        email_verified: 'true',
        exp: String(Math.floor(Date.now() / 1000) + 3600),
        iss: 'https://accounts.google.com',
        name: 'Nguyen Van Patient',
        picture: 'https://example.com/avatar.png',
        sub: 'google-subject-001',
      }),
    }));
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    if (originalGoogleMailerClientId === undefined) {
      delete process.env.GOOGLE_MAILER_CLIENT_ID;
    } else {
      process.env.GOOGLE_MAILER_CLIENT_ID = originalGoogleMailerClientId;
    }
    jest.clearAllMocks();
  });

  function createUseCase(): GoogleLoginUseCase {
    return new GoogleLoginUseCase(
      mockUserRepository,
      mockJwtService as unknown as JwtService,
      mockDataSource
    );
  }

  it('creates a patient user and auto patient profile on first Google login', async () => {
    const result = await createUseCase().execute({ idToken: 'valid-google-id-token' });

    expect(result.accessToken).toContain('15m');
    expect(result.refreshToken).toContain('7d');
    expect(result.isNewUser).toBe(true);
    expect(result.isNewPatientProfile).toBe(true);
    expect(result.profileRequiresCompletion).toBe(true);
    expect(result.user?.email).toBe('patient@example.com');
    expect(result.patients).toHaveLength(1);
    expect(result.patients[0]).toMatchObject({
      id: 'patient-id',
      email: 'patient@example.com',
      fullName: 'Nguyen Van Patient',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(roleRepository.save).toHaveBeenCalled();
    expect(patientRepository.save).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledTimes(2);
  });

  it('rejects Google tokens from an unexpected audience', async () => {
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        aud: 'other-client.apps.googleusercontent.com',
        email: 'patient@example.com',
        email_verified: 'true',
        exp: String(Math.floor(Date.now() / 1000) + 3600),
        iss: 'https://accounts.google.com',
        sub: 'google-subject-001',
      }),
    }));

    await expect(createUseCase().execute({ idToken: 'wrong-audience-token' })).rejects.toThrow(
      UnauthorizedException
    );
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(patientRepository.save).not.toHaveBeenCalled();
  });

  it('reuses existing user and patient profile by Google email', async () => {
    const existingUser = User.create(
      'existing-user-id',
      'patient@example.com',
      null,
      'hash',
      'patient-role-id'
    );
    usersDb.set(existingUser.id, existingUser);
    patientsByEmail = [
      {
        id: 'existing-patient-id',
        patientCode: 'BN-2026-0007',
        fullName: 'Existing Patient',
        dob: '1995-01-01',
        gender: 'FEMALE',
        phone: '0909000000',
        email: 'patient@example.com',
        address: null,
        cccd: null,
        guardianName: null,
        guardianPhone: null,
        guardianRelation: null,
        avatarUrl: null,
        createdAt: new Date('2026-06-24T00:00:00.000Z'),
        updatedAt: new Date('2026-06-24T00:00:00.000Z'),
      } as PatientOrmEntity,
    ];

    const result = await createUseCase().execute({ idToken: 'valid-google-id-token' });

    expect(result.isNewUser).toBe(false);
    expect(result.isNewPatientProfile).toBe(false);
    expect(result.profileRequiresCompletion).toBe(false);
    expect(result.activePatientId).toBe('existing-patient-id');
    expect(patientRepository.save).not.toHaveBeenCalled();
    expect(roleRepository.save).not.toHaveBeenCalled();
  });
});
