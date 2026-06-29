import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogOrmEntity } from '../database/audit-log.entity';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly ormRepository: Repository<AuditLogOrmEntity>,
  ) {}

  async save(auditLog: AuditLog): Promise<AuditLog> {
    const orm = this.toOrm(auditLog);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async findAll(filters?: {
    module?: string;
    action?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<[AuditLog[], number]> {
    const where: any = {};

    if (filters?.module) {
      where.module = filters.module;
    }
    if (filters?.action) {
      where.action = filters.action;
    }
    
    if (filters?.startDate && filters?.endDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = Between(start, end);
    } else if (filters?.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      where.createdAt = Between(start, new Date());
    }

    const options: FindManyOptions<AuditLogOrmEntity> = {
      where,
      order: { createdAt: 'DESC' },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
    };

    if (filters?.search) {
      const qb = this.ormRepository.createQueryBuilder('log');
      
      let hasWhere = false;
      if (filters.module) {
        qb.where('log.module = :module', { module: filters.module });
        hasWhere = true;
      }
      if (filters.action) {
        const cond = 'log.action = :action';
        if (hasWhere) qb.andWhere(cond, { action: filters.action });
        else { qb.where(cond, { action: filters.action }); hasWhere = true; }
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        const cond = 'log.createdAt >= :startDate';
        if (hasWhere) qb.andWhere(cond, { startDate: start });
        else { qb.where(cond, { startDate: start }); hasWhere = true; }
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        const cond = 'log.createdAt <= :endDate';
        if (hasWhere) qb.andWhere(cond, { endDate: end });
        else { qb.where(cond, { endDate: end }); hasWhere = true; }
      }

      const searchLower = `%${filters.search.toLowerCase()}%`;
      const searchCond = '(LOWER(log.userName) LIKE :search OR LOWER(log.userRole) LIKE :search OR LOWER(log.description) LIKE :search)';
      if (hasWhere) {
        qb.andWhere(searchCond, { search: searchLower });
      } else {
        qb.where(searchCond, { search: searchLower });
      }

      qb.orderBy('log.createdAt', 'DESC')
        .take(filters.limit ?? 50)
        .skip(filters.offset ?? 0);

      const [items, count] = await qb.getManyAndCount();
      return [items.map(orm => this.toDomain(orm)), count];
    }

    const [items, count] = await this.ormRepository.findAndCount(options);
    return [items.map(orm => this.toDomain(orm)), count];
  }

  private toDomain(orm: AuditLogOrmEntity): AuditLog {
    return new AuditLog(
      orm.id,
      orm.userId,
      orm.userName,
      orm.userRole,
      orm.action,
      orm.module,
      orm.description,
      orm.ipAddress,
      orm.createdAt,
    );
  }

  private toOrm(domain: AuditLog): AuditLogOrmEntity {
    const orm = new AuditLogOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.userId = domain.userId;
    orm.userName = domain.userName;
    orm.userRole = domain.userRole;
    orm.action = domain.action;
    orm.module = domain.module;
    orm.description = domain.description;
    orm.ipAddress = domain.ipAddress;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
