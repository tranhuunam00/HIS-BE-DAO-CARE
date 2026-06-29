import { Inject, Injectable } from '@nestjs/common';
import type { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { CreateAuditLogDto, AuditLogResponseDto } from '../dtos/audit-log.dto';

export const IAuditLogRepositoryToken = 'IAuditLogRepository';

@Injectable()
export class CreateAuditLogUseCase {
  constructor(
    @Inject(IAuditLogRepositoryToken)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(dto: CreateAuditLogDto): Promise<AuditLogResponseDto> {
    const auditLog = AuditLog.create(
      dto.userId || null,
      dto.userName || null,
      dto.userRole || null,
      dto.action,
      dto.module,
      dto.description,
      dto.ipAddress || null,
    );

    const saved = await this.auditLogRepository.save(auditLog);

    return {
      id: saved.id,
      userId: saved.userId,
      userName: saved.userName,
      userRole: saved.userRole,
      action: saved.action,
      module: saved.module,
      description: saved.description,
      ipAddress: saved.ipAddress,
      createdAt: saved.createdAt,
    };
  }
}
