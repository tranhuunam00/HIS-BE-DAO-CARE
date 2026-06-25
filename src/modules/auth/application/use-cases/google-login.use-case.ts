import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  BranchScopeMode,
  DEFAULT_GOOGLE_PATIENT_DOB,
  DEFAULT_GOOGLE_PATIENT_GENDER,
  GOOGLE_CLIENT_ID_ENV_KEYS,
  GOOGLE_PATIENT_PHONE_PREFIX,
  GOOGLE_TOKEN_INFO_URL,
  GOOGLE_TOKEN_ISSUERS,
  PASSWORD_HASH_ROUNDS,
  PATIENT_CODE_PREFIX,
  PATIENT_ROLE_DESCRIPTION,
  PATIENT_ROLE_NAME,
} from '../../domain/constants/auth.constants';
import { User } from '../../domain/entities/user.entity';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { RoleOrmEntity } from '../../infrastructure/database/role.entity';
import { PermissionOrmEntity } from '../../infrastructure/database/permission.entity';
import { PatientOrmEntity } from '../../../reception/infrastructure/database/patient.entity';
import { PatientResponseDto } from '../../../reception/application/dtos/patient.dto';
import { GoogleLoginDto, GoogleLoginResponseDto } from '../dtos/google-login.dto';

interface GoogleTokenInfoResponse {
  aud?: string;
  email?: string;
  email_verified?: boolean | string;
  exp?: string;
  iss?: string;
  name?: string;
  picture?: string;
  sub?: string;
}

interface PatientProfileResult {
  patients: PatientResponseDto[];
  isNewPatientProfile: boolean;
  profileRequiresCompletion: boolean;
}

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource
  ) {}

  async execute(dto: GoogleLoginDto): Promise<GoogleLoginResponseDto> {
    const googleProfile = await this.verifyGoogleIdToken(dto.idToken);
    const email = this.normalizeEmail(googleProfile.email);

    let user = await this.userRepository.findByEmail(email);
    let isNewUser = false;

    if (user) {
      this.ensureUserCanLogin(user);
    } else {
      const role = await this.ensurePatientRole();
      const passwordHash = await bcrypt.hash(randomUUID(), PASSWORD_HASH_ROUNDS);
      user = await this.userRepository.save(
        User.create(
          randomUUID(),
          email,
          null,
          passwordHash,
          role.id,
          true,
          null,
          BranchScopeMode.SPECIFIC,
          true
        )
      );
      isNewUser = true;
    }

    const patientProfile = await this.ensurePatientProfiles(email, googleProfile, dto);
    const tokenResponse = await this.issueTokens(user);

    return {
      ...tokenResponse,
      patients: patientProfile.patients,
      activePatientId: patientProfile.patients[0]?.id ?? null,
      isNewUser,
      isNewPatientProfile: patientProfile.isNewPatientProfile,
      profileRequiresCompletion: patientProfile.profileRequiresCompletion,
    };
  }

  private async verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfoResponse> {
    const clientIds = this.getConfiguredGoogleClientIds();
    if (clientIds.length === 0) {
      throw new InternalServerErrorException('Google OAuth client is not configured');
    }

    let response: Response;
    try {
      response = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`);
    } catch {
      throw new UnauthorizedException('Cannot verify Google token');
    }

    if (!response.ok) {
      throw new UnauthorizedException('Google token is invalid');
    }

    const payload = (await response.json()) as GoogleTokenInfoResponse;
    if (!payload.sub || !payload.email || !payload.aud) {
      throw new UnauthorizedException('Google token payload is incomplete');
    }

    if (!clientIds.includes(payload.aud)) {
      throw new UnauthorizedException('Google token audience is not allowed');
    }

    if (!payload.iss || !GOOGLE_TOKEN_ISSUERS.includes(payload.iss)) {
      throw new UnauthorizedException('Google token issuer is not allowed');
    }

    if (!this.isEmailVerified(payload.email_verified)) {
      throw new UnauthorizedException('Google email is not verified');
    }

    if (this.isExpired(payload.exp)) {
      throw new UnauthorizedException('Google token has expired');
    }

    return payload;
  }

  private getConfiguredGoogleClientIds(): string[] {
    const uniqueIds = new Set<string>();
    for (const key of GOOGLE_CLIENT_ID_ENV_KEYS) {
      const rawValue = process.env[key];
      if (!rawValue) {
        continue;
      }

      for (const value of rawValue.split(',')) {
        const trimmed = value.trim();
        if (trimmed) {
          uniqueIds.add(trimmed);
        }
      }
    }
    return [...uniqueIds];
  }

  private normalizeEmail(email: string | undefined): string {
    const normalized = email?.trim().toLowerCase();
    if (!normalized) {
      throw new UnauthorizedException('Google token does not include an email');
    }
    return normalized;
  }

  private isEmailVerified(value: boolean | string | undefined): boolean {
    return value === true || value === 'true';
  }

  private isExpired(exp: string | undefined): boolean {
    if (!exp) {
      return false;
    }

    const expiresAtSeconds = Number(exp);
    return Number.isFinite(expiresAtSeconds) && expiresAtSeconds * 1000 <= Date.now();
  }

  private ensureUserCanLogin(user: User): void {
    if (!user.isActive || user.lockedAt) {
      throw new UnauthorizedException('Account is disabled or locked');
    }
  }

  private async ensurePatientRole(): Promise<RoleOrmEntity> {
    const roleRepository = this.dataSource.getRepository(RoleOrmEntity);
    const permissionRepository = this.dataSource.getRepository(PermissionOrmEntity);

    const requiredPermNames = [
      'branch:read',
      'specialty:read',
      'service:read',
      'staff:read',
      'org:read',
      'org:write',
    ];
    const permissions = await permissionRepository.find({
      where: requiredPermNames.map((name) => ({ name })),
    });

    let role = await roleRepository.findOne({
      where: { name: PATIENT_ROLE_NAME },
      relations: { permissions: true },
    });

    if (role) {
      const rolePermNames = new Set(role.permissions.map((p) => p.name));
      const hasAll = requiredPermNames.every((name) => rolePermNames.has(name));
      if (!hasAll) {
        role.permissions = permissions;
        role = await roleRepository.save(role);
      }
      return role;
    }

    return await roleRepository.save(
      roleRepository.create({
        name: PATIENT_ROLE_NAME,
        description: PATIENT_ROLE_DESCRIPTION,
        permissions,
      })
    );
  }

  private async ensurePatientProfiles(
    email: string,
    googleProfile: GoogleTokenInfoResponse,
    dto: GoogleLoginDto
  ): Promise<PatientProfileResult> {
    const patientRepository = this.dataSource.getRepository(PatientOrmEntity);
    const patientsByEmail = await this.findPatientsByEmail(patientRepository, email);
    if (patientsByEmail.length > 0) {
      const patients = patientsByEmail.map((patient) => this.mapPatient(patient));
      return {
        patients,
        isNewPatientProfile: false,
        profileRequiresCompletion: patients.some((patient) => this.needsProfileCompletion(patient)),
      };
    }

    const requestedPhone = dto.phone?.trim();
    if (requestedPhone) {
      const linkedPatient = await this.linkExistingPatientByPhone(patientRepository, requestedPhone, email, googleProfile);
      if (linkedPatient) {
        const patient = this.mapPatient(linkedPatient);
        return {
          patients: [patient],
          isNewPatientProfile: false,
          profileRequiresCompletion: this.needsProfileCompletion(patient),
        };
      }
    }

    const createdPatient = await this.createGooglePatient(patientRepository, email, googleProfile, dto);
    const patient = this.mapPatient(createdPatient);
    return {
      patients: [patient],
      isNewPatientProfile: true,
      profileRequiresCompletion: this.needsProfileCompletion(patient),
    };
  }

  private async findPatientsByEmail(
    patientRepository: Repository<PatientOrmEntity>,
    email: string
  ): Promise<PatientOrmEntity[]> {
    return await patientRepository
      .createQueryBuilder('patient')
      .where('LOWER(patient.email) = :email', { email })
      .orderBy('patient.fullName', 'ASC')
      .getMany();
  }

  private async linkExistingPatientByPhone(
    patientRepository: Repository<PatientOrmEntity>,
    phone: string,
    email: string,
    googleProfile: GoogleTokenInfoResponse
  ): Promise<PatientOrmEntity | null> {
    const existingPatient = await patientRepository.findOneBy({ phone });
    if (!existingPatient) {
      return null;
    }

    if (existingPatient.email && this.normalizeEmail(existingPatient.email) !== email) {
      throw new ConflictException('Phone number belongs to another patient profile');
    }

    existingPatient.email = email;
    existingPatient.avatarUrl = existingPatient.avatarUrl ?? googleProfile.picture ?? null;
    return await patientRepository.save(existingPatient);
  }

  private async createGooglePatient(
    patientRepository: Repository<PatientOrmEntity>,
    email: string,
    googleProfile: GoogleTokenInfoResponse,
    dto: GoogleLoginDto
  ): Promise<PatientOrmEntity> {
    const fallbackPhone = this.createFallbackPhone(googleProfile.sub);
    const patient = patientRepository.create({
      patientCode: await this.generatePatientCode(patientRepository),
      fullName: this.getPatientFullName(dto, googleProfile, email),
      dob: dto.dob ?? DEFAULT_GOOGLE_PATIENT_DOB,
      gender: dto.gender ?? DEFAULT_GOOGLE_PATIENT_GENDER,
      phone: dto.phone?.trim() || fallbackPhone,
      email,
      address: dto.address?.trim() || null,
      cccd: null,
      guardianName: null,
      guardianPhone: null,
      guardianRelation: null,
      avatarUrl: googleProfile.picture ?? null,
    });

    return await patientRepository.save(patient);
  }

  private async generatePatientCode(patientRepository: Repository<PatientOrmEntity>): Promise<string> {
    const count = await patientRepository.count();
    const year = new Date().getFullYear();
    const nextSeq = (count + 1).toString().padStart(4, '0');
    return `${PATIENT_CODE_PREFIX}-${year}-${nextSeq}`;
  }

  private getPatientFullName(
    dto: GoogleLoginDto,
    googleProfile: GoogleTokenInfoResponse,
    email: string
  ): string {
    return dto.fullName?.trim() || googleProfile.name?.trim() || email.split('@')[0];
  }

  private createFallbackPhone(googleSubject: string | undefined): string {
    const subject = googleSubject?.replace(/[^A-Za-z0-9]/g, '') || randomUUID().replace(/-/g, '');
    return `${GOOGLE_PATIENT_PHONE_PREFIX}${subject.slice(0, 24)}`;
  }

  private needsProfileCompletion(patient: PatientResponseDto): boolean {
    return (
      patient.phone.startsWith(GOOGLE_PATIENT_PHONE_PREFIX) ||
      patient.dob === DEFAULT_GOOGLE_PATIENT_DOB ||
      patient.gender === DEFAULT_GOOGLE_PATIENT_GENDER
    );
  }

  private async issueTokens(user: User): Promise<Pick<GoogleLoginResponseDto, 'accessToken' | 'refreshToken' | 'user'>> {
    const activeBranchId = user.defaultBranchId ?? user.branchScopeIds[0] ?? null;
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      activeBranchId,
      branchScopeMode: user.branchScopeMode,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, PASSWORD_HASH_ROUNDS);
    const updatedUser = user.resetFailedLoginCount().updateRefreshToken(refreshTokenHash);
    await this.userRepository.save(updatedUser);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roleId: user.roleId,
        defaultBranchId: user.defaultBranchId,
        activeBranchId,
        branchScopeMode: user.branchScopeMode,
        branchScopeIds: user.branchScopeIds,
        bypassIpRestriction: user.bypassIpRestriction,
      },
    };
  }

  private mapPatient(patient: PatientOrmEntity): PatientResponseDto {
    return {
      id: patient.id,
      patientCode: patient.patientCode,
      fullName: patient.fullName,
      dob: patient.dob,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      cccd: patient.cccd,
      guardianName: patient.guardianName,
      guardianPhone: patient.guardianPhone,
      guardianRelation: patient.guardianRelation,
      avatarUrl: patient.avatarUrl,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }
}
