import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { RegisterDto } from '../dtos/register.dto';
import { User } from '../../domain/entities/user.entity';
import { AppDataSource } from '../../../../infrastructure/database/data-source';
import { RoleOrmEntity } from '../../infrastructure/database/role.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const roleName = dto.roleName || 'DOCTOR';
    const roleRepository = AppDataSource.getRepository(RoleOrmEntity);
    const role = await roleRepository.findOneBy({ name: roleName });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy vai trò ${roleName}`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = randomUUID();

    const user = User.create(userId, dto.email, null, passwordHash, role.id, true);
    return await this.userRepository.save(user);
  }
}
