import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PatientOrmEntity } from '../../infrastructure/database/patient.entity';
import { UserOrmEntity } from '../../../auth/infrastructure/database/user.entity';
import { RoleOrmEntity } from '../../../auth/infrastructure/database/role.entity';
import { PASSWORD_HASH_ROUNDS, PATIENT_ROLE_NAME, BranchScopeMode } from '../../../auth/domain/constants/auth.constants';

@Injectable()
export class ResetPatientPasswordUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(patientId: string, passwordHashRaw: string): Promise<void> {
    const patientRepository = this.dataSource.getRepository(PatientOrmEntity);
    const userRepository = this.dataSource.getRepository(UserOrmEntity);
    const roleRepository = this.dataSource.getRepository(RoleOrmEntity);

    const patient = await patientRepository.findOneBy({ id: patientId });
    if (!patient) {
      throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');
    }

    const email = patient.email?.trim().toLowerCase();
    const phone = patient.phone?.trim();

    if (!email && !phone) {
      throw new ConflictException('Hồ sơ bệnh nhân không có email hoặc số điện thoại để đăng ký tài khoản');
    }

    const passwordHash = await bcrypt.hash(passwordHashRaw, PASSWORD_HASH_ROUNDS);

    // Look for existing user by email or username (which could be their email/phone)
    let user: UserOrmEntity | null = null;
    if (email) {
      user = await userRepository.findOneBy({ email });
    }
    if (!user && phone) {
      user = await userRepository.findOneBy({ username: phone });
    }

    if (user) {
      // Update password
      user.passwordHash = passwordHash;
      await userRepository.save(user);
    } else {
      // Find patient role
      const role = await roleRepository.findOneBy({ name: PATIENT_ROLE_NAME });
      if (!role) {
        throw new NotFoundException(`Không tìm thấy vai trò ${PATIENT_ROLE_NAME} trong hệ thống`);
      }

      // Create new user account
      const newUser = userRepository.create({
        id: randomUUID(),
        email: email || `${phone}@hisdaocare.com`,
        username: phone || email || null,
        passwordHash,
        roleId: role.id,
        isActive: true,
        branchScopeMode: BranchScopeMode.SPECIFIC,
        bypassIpRestriction: true,
      });

      await userRepository.save(newUser);
    }
  }
}
