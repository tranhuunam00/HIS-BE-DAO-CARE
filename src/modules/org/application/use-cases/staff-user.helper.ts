import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserOrmEntity } from '../../../auth/infrastructure/database/user.entity';
import { RoleOrmEntity } from '../../../auth/infrastructure/database/role.entity';
import { PASSWORD_HASH_ROUNDS, BranchScopeMode } from '../../../auth/domain/constants/auth.constants';

export async function ensureStaffUser(
  dataSource: DataSource,
  email: string,
  phone: string,
  username?: string,
  password?: string,
  roleId?: string,
  currentUserId?: string | null
): Promise<string | null> {
  if (!username && !password && !roleId) {
    return currentUserId || null;
  }

  const userRepository = dataSource.getRepository(UserOrmEntity);
  const roleRepository = dataSource.getRepository(RoleOrmEntity);

  const trimmedUsername = username?.trim();
  const trimmedEmail = email?.trim().toLowerCase();

  // Validate uniqueness
  if (trimmedUsername) {
    const existing = await userRepository.findOneBy({ username: trimmedUsername });
    if (existing && existing.id !== currentUserId) {
      throw new ConflictException('Tên đăng nhập (Username) này đã được sử dụng bởi tài khoản khác');
    }
  }

  if (trimmedEmail) {
    const existing = await userRepository.findOneBy({ email: trimmedEmail });
    if (existing && existing.id !== currentUserId) {
      throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác');
    }
  }

  const passwordHash = password ? await bcrypt.hash(password, PASSWORD_HASH_ROUNDS) : undefined;

  let user: UserOrmEntity | null = null;
  if (currentUserId) {
    user = await userRepository.findOneBy({ id: currentUserId });
  }

  if (user) {
    if (trimmedUsername) user.username = trimmedUsername;
    if (trimmedEmail) user.email = trimmedEmail;
    if (passwordHash) user.passwordHash = passwordHash;
    if (roleId) user.roleId = roleId;
    const saved = await userRepository.save(user);
    return saved.id;
  } else {
    // Determine default role if not provided
    let finalRoleId = roleId;
    if (!finalRoleId) {
      const defaultRole = await roleRepository.findOneBy({ name: 'DOCTOR' });
      if (!defaultRole) {
        throw new NotFoundException('Không tìm thấy vai trò mặc định (DOCTOR)');
      }
      finalRoleId = defaultRole.id;
    }

    const newUser = userRepository.create({
      id: randomUUID(),
      email: trimmedEmail || `${phone}@hisdaocare.com`,
      username: trimmedUsername || phone,
      passwordHash: passwordHash || (await bcrypt.hash('123456', PASSWORD_HASH_ROUNDS)),
      roleId: finalRoleId,
      isActive: true,
      branchScopeMode: BranchScopeMode.ALL,
      bypassIpRestriction: true,
    });

    const saved = await userRepository.save(newUser);
    return saved.id;
  }
}
