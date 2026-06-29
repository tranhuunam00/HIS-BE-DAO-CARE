import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { ListAuditLogsUseCase } from '../../../application/use-cases/list-audit-logs.use-case';
import { QueryAuditLogDto, AuditLogResponseDto } from '../../../application/dtos/audit-log.dto';

@ApiTags('Auth - Audit Logs')
@Controller('auth/audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AuditLogController {
  constructor(
    private readonly listAuditLogsUseCase: ListAuditLogsUseCase,
  ) {}

  @Get()
  @RequirePermissions('org:read')
  @ApiOperation({ summary: 'Lấy danh sách nhật ký thao tác hệ thống' })
  @ApiResponse({ status: 200, type: [AuditLogResponseDto] })
  async getAuditLogs(
    @Query() query: QueryAuditLogDto,
  ): Promise<{ items: AuditLogResponseDto[]; total: number }> {
    return await this.listAuditLogsUseCase.execute(query);
  }
}
