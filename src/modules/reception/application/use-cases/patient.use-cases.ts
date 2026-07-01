import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Patient } from '../../domain/entities/patient.model';
import { PatientOrmEntity } from '../../infrastructure/database/patient.entity';
import type { IPatientRepository } from '../../domain/repositories/patient.repository.interface';
import { CreatePatientDto, UpdatePatientDto, PatientResponseDto } from '../dtos/patient.dto';
import { UserOrmEntity } from '../../../auth/infrastructure/database/user.entity';
import { RoleOrmEntity } from '../../../auth/infrastructure/database/role.entity';
import { PASSWORD_HASH_ROUNDS, PATIENT_ROLE_NAME, BranchScopeMode } from '../../../auth/domain/constants/auth.constants';

export const IPatientRepositoryToken = 'IPatientRepository';

export async function findPatientUser(
  patient: Patient | PatientOrmEntity,
  dataSource: DataSource
): Promise<UserOrmEntity | null> {
  const userRepository = dataSource.getRepository(UserOrmEntity);
  const email = patient.email?.trim().toLowerCase();
  const phone = patient.phone?.trim();

  if (email) {
    const user = await userRepository.findOneBy({ email });
    if (user) return user;
  }
  if (phone) {
    const user = await userRepository.findOneBy({ username: phone });
    if (user) return user;
  }
  if (phone) {
    const user = await userRepository.findOneBy({ email: `${phone}@hisdaocare.com` });
    if (user) return user;
  }
  return null;
}

export async function mapPatientToDto(model: Patient, dataSource: DataSource): Promise<PatientResponseDto> {
  const user = await findPatientUser(model, dataSource);

  return {
    id: model.id,
    patientCode: model.patientCode,
    fullName: model.fullName,
    dob: model.dob,
    gender: model.gender,
    phone: model.phone,
    email: model.email,
    address: model.address,
    cccd: model.cccd,
    guardianName: model.guardianName,
    guardianPhone: model.guardianPhone,
    guardianRelation: model.guardianRelation,
    avatarUrl: model.avatarUrl,
    createdAt: model.createdAt!,
    updatedAt: model.updatedAt!,
    username: user ? user.username : null,
  };
}

export async function ensurePatientUser(
  patient: Patient,
  dataSource: DataSource,
  username?: string,
  password?: string,
  existingUser?: UserOrmEntity | null
) {
  if (!username && !password) return;

  const userRepository = dataSource.getRepository(UserOrmEntity);
  const roleRepository = dataSource.getRepository(RoleOrmEntity);

  const email = patient.email?.trim().toLowerCase();
  const phone = patient.phone?.trim();

  const user = existingUser !== undefined ? existingUser : await findPatientUser(patient, dataSource);
  const passwordHash = password ? await bcrypt.hash(password, PASSWORD_HASH_ROUNDS) : undefined;

  if (user) {
    if (username) user.username = username;
    if (passwordHash) user.passwordHash = passwordHash;
    user.email = email || `${phone}@hisdaocare.com`;
    await userRepository.save(user);
  } else {
    const role = await roleRepository.findOneBy({ name: PATIENT_ROLE_NAME });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy vai trò ${PATIENT_ROLE_NAME}`);
    }

    const newUser = userRepository.create({
      id: randomUUID(),
      email: email || `${phone}@hisdaocare.com`,
      username: username || phone || email || null,
      passwordHash: passwordHash || (await bcrypt.hash('123456', PASSWORD_HASH_ROUNDS)),
      roleId: role.id,
      isActive: true,
      branchScopeMode: BranchScopeMode.SPECIFIC,
      bypassIpRestriction: true,
    });

    await userRepository.save(newUser);
  }
}

@Injectable()
export class ListPatientsUseCase {
  constructor(
    @Inject(IPatientRepositoryToken)
    private readonly repository: IPatientRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(search?: string): Promise<PatientResponseDto[]> {
    const list = await this.repository.findAll(search);
    return Promise.all(list.map((model) => mapPatientToDto(model, this.dataSource)));
  }
}

@Injectable()
export class GetPatientUseCase {
  constructor(
    @Inject(IPatientRepositoryToken)
    private readonly repository: IPatientRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: string): Promise<PatientResponseDto> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');
    }
    return mapPatientToDto(patient, this.dataSource);
  }
}

@Injectable()
export class CreatePatientUseCase {
  constructor(
    @Inject(IPatientRepositoryToken)
    private readonly repository: IPatientRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: CreatePatientDto): Promise<PatientResponseDto> {
    const existing = await this.repository.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException('Số điện thoại bệnh nhân đã tồn tại trong hệ thống');
    }

    if (dto.cccd) {
      const existingCccd = await this.repository.findByCccd(dto.cccd);
      if (existingCccd) {
        throw new ConflictException('Số CCCD bệnh nhân đã tồn tại trong hệ thống');
      }
    }

    const userRepository = this.dataSource.getRepository(UserOrmEntity);

    if (dto.username) {
      const existingUser = await userRepository.findOneBy({ username: dto.username });
      if (existingUser) {
        throw new ConflictException('Tên đăng nhập (Username) này đã được sử dụng');
      }
    }

    if (dto.email) {
      const existingEmail = await userRepository.findOneBy({ email: dto.email.trim().toLowerCase() });
      if (existingEmail) {
        throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác');
      }
    }

    // Auto-generate patient code
    const count = await this.repository.countAll();
    const nextSeq = (count + 1).toString().padStart(4, '0');
    const patientCode = `BN-2026-${nextSeq}`;

    const newPatient = await this.repository.save({
      patientCode,
      fullName: dto.fullName,
      dob: dto.dob,
      gender: dto.gender,
      phone: dto.phone,
      email: dto.email || null,
      address: dto.address || null,
      cccd: dto.cccd || null,
      guardianName: dto.guardianName || null,
      guardianPhone: dto.guardianPhone || null,
      guardianRelation: dto.guardianRelation || null,
      avatarUrl: dto.avatarUrl || null,
    });

    await ensurePatientUser(newPatient, this.dataSource, dto.username, dto.password);

    return mapPatientToDto(newPatient, this.dataSource);
  }
}

@Injectable()
export class UpdatePatientUseCase {
  constructor(
    @Inject(IPatientRepositoryToken)
    private readonly repository: IPatientRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: string, dto: UpdatePatientDto): Promise<PatientResponseDto> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');
    }

    if (dto.phone && dto.phone !== patient.phone) {
      const existing = await this.repository.findByPhone(dto.phone);
      if (existing) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi bệnh nhân khác');
      }
    }

    if (dto.cccd && dto.cccd !== patient.cccd) {
      const existingCccd = await this.repository.findByCccd(dto.cccd);
      if (existingCccd) {
        throw new ConflictException('Số CCCD này đã được sử dụng bởi bệnh nhân khác');
      }
    }

    const userRepository = this.dataSource.getRepository(UserOrmEntity);
    let patientUser = await findPatientUser(patient, this.dataSource);

    if (!patientUser) {
      if (dto.email) {
        const u = await userRepository.findOneBy({ email: dto.email.trim().toLowerCase() });
        if (u) {
          const roleRepository = this.dataSource.getRepository(RoleOrmEntity);
          const patientRole = await roleRepository.findOneBy({ name: PATIENT_ROLE_NAME });
          if (u.roleId === patientRole?.id) {
            patientUser = u;
          }
        }
      }
      if (!patientUser && dto.username) {
        const u = await userRepository.findOneBy({ username: dto.username.trim() });
        if (u) {
          const roleRepository = this.dataSource.getRepository(RoleOrmEntity);
          const patientRole = await roleRepository.findOneBy({ name: PATIENT_ROLE_NAME });
          if (u.roleId === patientRole?.id) {
            patientUser = u;
          }
        }
      }
    }

    if (dto.username) {
      const existingUser = await userRepository.findOneBy({ username: dto.username });
      if (existingUser && existingUser.id !== patientUser?.id) {
        throw new ConflictException('Tên đăng nhập (Username) này đã được sử dụng bởi tài khoản khác');
      }
    }

    if (dto.email && dto.email !== patient.email) {
      const existingEmailUser = await userRepository.findOneBy({ email: dto.email.trim().toLowerCase() });
      if (existingEmailUser && existingEmailUser.id !== patientUser?.id) {
        throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác');
      }
    }

    const { username, password, ...patientUpdateData } = dto;
    const updated = await this.repository.save({
      ...patient,
      ...patientUpdateData,
    });

    await ensurePatientUser(updated, this.dataSource, dto.username, dto.password, patientUser);

    return mapPatientToDto(updated, this.dataSource);
  }
}
