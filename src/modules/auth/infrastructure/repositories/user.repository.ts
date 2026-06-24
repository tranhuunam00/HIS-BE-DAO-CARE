import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../database/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const ormUser = await this.ormRepository.findOne({
      where: { email },
      relations: { branchScopes: true },
    });
    return ormUser ? this.toDomain(ormUser) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const ormUser = await this.ormRepository.findOne({
      where: { username },
      relations: { branchScopes: true },
    });
    return ormUser ? this.toDomain(ormUser) : null;
  }

  async findByLoginIdentity(identity: string): Promise<User | null> {
    const ormUser = await this.ormRepository.findOne({
      where: [{ email: identity }, { username: identity }],
      relations: { branchScopes: true },
    });
    return ormUser ? this.toDomain(ormUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const ormUser = await this.ormRepository.findOne({
      where: { id },
      relations: { branchScopes: true },
    });
    return ormUser ? this.toDomain(ormUser) : null;
  }

  async save(user: User): Promise<User> {
    const ormUser = this.toOrm(user);
    const savedOrm = await this.ormRepository.save(ormUser);
    return this.toDomain(savedOrm);
  }

  private toDomain(orm: UserOrmEntity): User {
    return new User(
      orm.id,
      orm.email,
      orm.username,
      orm.passwordHash,
      orm.refreshTokenHash,
      orm.isActive,
      orm.roleId,
      orm.defaultBranchId,
      orm.branchScopeMode,
      orm.bypassIpRestriction,
      orm.loginTimeWindowId,
      orm.failedLoginCount,
      orm.failedLoginLimit,
      orm.lockedAt,
      orm.lockedBy,
      orm.lockReason,
      orm.createdAt,
      orm.updatedAt,
      orm.branchScopes?.map((scope) => scope.branchId) ?? []
    );
  }

  private toOrm(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.email = domain.email;
    orm.username = domain.username;
    orm.passwordHash = domain.passwordHash;
    orm.refreshTokenHash = domain.refreshTokenHash;
    orm.isActive = domain.isActive;
    orm.roleId = domain.roleId;
    orm.defaultBranchId = domain.defaultBranchId;
    orm.branchScopeMode = domain.branchScopeMode;
    orm.bypassIpRestriction = domain.bypassIpRestriction;
    orm.loginTimeWindowId = domain.loginTimeWindowId;
    orm.failedLoginCount = domain.failedLoginCount;
    orm.failedLoginLimit = domain.failedLoginLimit;
    orm.lockedAt = domain.lockedAt;
    orm.lockedBy = domain.lockedBy;
    orm.lockReason = domain.lockReason;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
