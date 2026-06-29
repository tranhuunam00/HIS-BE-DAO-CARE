import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuditLogUseCase, IAuditLogRepositoryToken } from '../create-audit-log.use-case';
import { ListAuditLogsUseCase } from '../list-audit-logs.use-case';
import { AuditLog } from '../../../domain/entities/audit-log.entity';

describe('AuditLog Use Cases', () => {
  let createAuditLogUseCase: CreateAuditLogUseCase;
  let listAuditLogsUseCase: ListAuditLogsUseCase;
  let mockAuditLogRepository: any;

  const mockAuditLog = new AuditLog(
    'log-1',
    'user-1',
    'BS. Trần Hữu Nam',
    'DOCTOR',
    'ADD_SERVICE',
    'BILLING',
    'Đã chỉ định dịch vụ Xét nghiệm máu',
    '127.0.0.1',
    new Date(),
  );

  beforeEach(async () => {
    mockAuditLogRepository = {
      save: jest.fn(async (log) => {
        return new AuditLog(
          'log-1',
          log.userId,
          log.userName,
          log.userRole,
          log.action,
          log.module,
          log.description,
          log.ipAddress,
          log.createdAt || new Date(),
        );
      }),
      findAll: jest.fn(async () => {
        return [[mockAuditLog], 1];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAuditLogUseCase,
        ListAuditLogsUseCase,
        {
          provide: IAuditLogRepositoryToken,
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    createAuditLogUseCase = module.get<CreateAuditLogUseCase>(CreateAuditLogUseCase);
    listAuditLogsUseCase = module.get<ListAuditLogsUseCase>(ListAuditLogsUseCase);
  });

  describe('CreateAuditLogUseCase', () => {
    it('should successfully save and return an audit log', async () => {
      const result = await createAuditLogUseCase.execute({
        userId: 'user-1',
        userName: 'BS. Trần Hữu Nam',
        userRole: 'DOCTOR',
        action: 'ADD_SERVICE',
        module: 'BILLING',
        description: 'Đã chỉ định dịch vụ Xét nghiệm máu',
        ipAddress: '127.0.0.1',
      });

      expect(mockAuditLogRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('log-1');
      expect(result.userName).toBe('BS. Trần Hữu Nam');
      expect(result.action).toBe('ADD_SERVICE');
    });
  });

  describe('ListAuditLogsUseCase', () => {
    it('should query and return list of audit logs with total count', async () => {
      const result = await listAuditLogsUseCase.execute({
        search: 'Trần Hữu Nam',
        module: 'BILLING',
      });

      expect(mockAuditLogRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Trần Hữu Nam',
          module: 'BILLING',
        })
      );
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe('log-1');
    });
  });
});
