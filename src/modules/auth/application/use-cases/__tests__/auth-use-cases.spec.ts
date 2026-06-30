import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../login.use-case';
import { RefreshTokenUseCase } from '../refresh-token.use-case';
import { LogoutUseCase } from '../logout.use-case';
import { IUserRepositoryToken } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { StaffOrmEntity } from '../../../../org/infrastructure/database/staff.entity';

describe('Auth Use Cases', () => {
  let loginUseCase: LoginUseCase;
  let refreshTokenUseCase: RefreshTokenUseCase;
  let logoutUseCase: LogoutUseCase;

  const mockUser = User.create(
    '10000000-0000-4000-8000-000000000001',
    'admin@hisdaocare.com',
    'admin',
    bcrypt.hashSync('Admin@HIS2026!', 10),
    'admin-role-id'
  );

  let usersDb: Map<string, User> = new Map();

  const mockUserRepository = {
    findByEmail: jest.fn(async (email: string) => {
      for (const u of usersDb.values()) {
        if (u.email === email) return u;
      }
      return null;
    }),
    findByUsername: jest.fn(async (username: string) => {
      for (const u of usersDb.values()) {
        if (u.username === username) return u;
      }
      return null;
    }),
    findByLoginIdentity: jest.fn(async (identity: string) => {
      for (const u of usersDb.values()) {
        if (u.email === identity || u.username === identity) return u;
      }
      return null;
    }),
    findById: jest.fn(async (id: string) => {
      return usersDb.get(id) || null;
    }),
    save: jest.fn(async (user: User) => {
      usersDb.set(user.id, user);
      return user;
    }),
  };

  const mockJwtService = {
    signAsync: jest.fn(async (payload: any, options?: any) => {
      return `mocked-jwt-token-for-${payload.sub}-${options?.expiresIn || 'default'}`;
    }),
  };

  let mockStaff: any = null;

  const mockDataSource = {
    getRepository: jest.fn((entity: any) => {
      if (entity === StaffOrmEntity) {
        return {
          findOneBy: jest.fn(async () => mockStaff),
        };
      }
      return {
        findOneBy: jest.fn(),
        find: jest.fn(async () => []),
      };
    }),
  };

  beforeEach(async () => {
    usersDb = new Map();
    usersDb.set(mockUser.id, mockUser);
    mockStaff = null;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        RefreshTokenUseCase,
        LogoutUseCase,
        {
          provide: IUserRepositoryToken,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);

    jest.clearAllMocks();
  });

  describe('LoginUseCase', () => {
    it('should successfully authenticate user and return tokens', async () => {
      const result = await loginUseCase.execute({
        email: 'admin@hisdaocare.com',
        password: 'Admin@HIS2026!',
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toContain('mocked-jwt-token-for-10000000-0000-4000-8000-000000000001-15m');
      expect(result.refreshToken).toContain('mocked-jwt-token-for-10000000-0000-4000-8000-000000000001-7d');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      await expect(
        loginUseCase.execute({
          email: 'wrong@hisdaocare.com',
          password: 'Admin@HIS2026!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      await expect(
        loginUseCase.execute({
          email: 'admin@hisdaocare.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow(UnauthorizedException);
      expect(usersDb.get(mockUser.id)?.failedLoginCount).toBe(1);
    });

    it('should throw UnauthorizedException if staff profile is inactive', async () => {
      mockStaff = {
        id: 'staff-id',
        userId: mockUser.id,
        isActive: false,
        fullName: 'Inactive Staff',
      };

      await expect(
        loginUseCase.execute({
          email: 'admin@hisdaocare.com',
          password: 'Admin@HIS2026!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('RefreshTokenUseCase', () => {
    it('should successfully rotate tokens', async () => {
      // Setup: first login to save a refresh token hash in db
      const loginTokens = await loginUseCase.execute({
        email: 'admin@hisdaocare.com',
        password: 'Admin@HIS2026!',
      });

      const result = await refreshTokenUseCase.execute(
        '10000000-0000-4000-8000-000000000001',
        loginTokens.refreshToken
      );

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException if refresh token does not match hash', async () => {
      await expect(
        refreshTokenUseCase.execute(
          '10000000-0000-4000-8000-000000000001',
          'invalid-refresh-token'
        )
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if staff profile is inactive during refresh', async () => {
      // First login to seed token
      const loginTokens = await loginUseCase.execute({
        email: 'admin@hisdaocare.com',
        password: 'Admin@HIS2026!',
      });

      mockStaff = {
        id: 'staff-id',
        userId: mockUser.id,
        isActive: false,
        fullName: 'Inactive Staff',
      };

      await expect(
        refreshTokenUseCase.execute(
          '10000000-0000-4000-8000-000000000001',
          loginTokens.refreshToken
        )
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('LogoutUseCase', () => {
    it('should revoke refresh token hash', async () => {
      // First login to seed token
      await loginUseCase.execute({
        email: 'admin@hisdaocare.com',
        password: 'Admin@HIS2026!',
      });

      await logoutUseCase.execute('10000000-0000-4000-8000-000000000001');

      const userInDb = usersDb.get('10000000-0000-4000-8000-000000000001');
      expect(userInDb?.refreshTokenHash).toBeNull();
    });

    it('should throw NotFoundException if user not found', async () => {
      await expect(
        logoutUseCase.execute('non-existent-user-id')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
