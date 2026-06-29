import { AuditLog } from '../entities/audit-log.entity';

export interface IAuditLogRepository {
  save(auditLog: AuditLog): Promise<AuditLog>;
  findAll(filters?: {
    module?: string;
    action?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<[AuditLog[], number]>;
}
