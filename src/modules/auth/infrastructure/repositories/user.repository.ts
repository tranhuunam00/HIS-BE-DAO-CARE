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
    });
    return ormUser ? this.toDomain(ormUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const ormUser = await this.ormRepository.findOne({
      where: { id },
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
      orm.passwordHash,
      orm.refreshTokenHash,
      orm.isActive,
      orm.roleId,
      orm.createdAt,
      orm.updatedAt
    );
  }

  private toOrm(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.email = domain.email;
    orm.passwordHash = domain.passwordHash;
    orm.refreshTokenHash = domain.refreshTokenHash;
    orm.isActive = domain.isActive;
    orm.roleId = domain.roleId;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
