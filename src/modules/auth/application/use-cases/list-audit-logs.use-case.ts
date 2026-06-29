import { Inject, Injectable } from '@nestjs/common';
import type { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { QueryAuditLogDto, AuditLogResponseDto } from '../dtos/audit-log.dto';

export const IAuditLogRepositoryToken = 'IAuditLogRepository';

@Injectable()
export class ListAuditLogsUseCase {
  constructor(
    @Inject(IAuditLogRepositoryToken)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(query: QueryAuditLogDto): Promise<{ items: AuditLogResponseDto[]; total: number }> {
    const [items, total] = await this.auditLogRepository.findAll({
      module: query.module,
      action: query.action,
      search: query.search,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0,
    });

    return {
      items: items.map(item => ({
        id: item.id,
        userId: item.userId,
        userName: item.userName,
        userRole: item.userRole,
        action: item.action,
        module: item.module,
        description: item.description,
        ipAddress: item.ipAddress,
        createdAt: item.createdAt,
      })),
      total,
    };
  }
}
